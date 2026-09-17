import { type ChangeEvent, useMemo, useState } from "react";
import { useAction } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { createFileRoute } from "@tanstack/react-router";
import { convexConfigured } from "../../../lib/convex-client";
import styles from "./index.module.css";

export const Route = createFileRoute("/apps/jevmappning/")({
  component: JevMappningRoute,
});

type TargetField = {
  key: "articleNumber" | "name" | "ean" | "brand" | "price";
  label: string;
  description: string;
};

type ParsedCsv = {
  delimiter: string;
  headers: Array<string>;
  rows: Array<Array<string>>;
};

type MappingProbability = {
  candidateKey: string;
  sourceHeader: string | null;
  probability: number;
};

type MappingRow = {
  targetField: string;
  targetLabel: string;
  selectedCandidateKey: string;
  selectedSourceHeader: string | null;
  confidence: number;
  score: number;
  scoreConfidence: number;
  needsHuman: boolean;
  probabilities: Array<MappingProbability>;
};

type MappingResponse = {
  model: string;
  mappings: Array<MappingRow>;
};

type CategoryProbability = {
  candidateKey: string;
  label: string;
  probability: number;
};

type CategoryLevel = {
  level: number;
  levelName: string;
  selectedKey: string;
  selectedLabel: string;
  confidence: number;
  probabilities: Array<CategoryProbability>;
};

type CategoryResponse = {
  model: string;
  levels: Array<CategoryLevel>;
  qualityScore: number;
  qualityConfidence: number;
  needsHuman: boolean;
};

const selectMappingsAction = makeFunctionReference<
  "action",
  {
    sourceHeaders: Array<string>;
    sampleRows: Array<Array<string>>;
    targetFields: Array<{ key: string; label: string; description: string }>;
  },
  MappingResponse
>("jevmappning:jevmappning_selectFieldMappings");

const classifySampleAction = makeFunctionReference<
  "action",
  {
    product: {
      articleNumber: string;
      name: string;
      ean: string;
      brand: string;
      price: string;
    };
  },
  CategoryResponse
>("jevmappning:jevmappning_classifySampleProduct");

const HUMAN_REVIEW_THRESHOLD = 0.7;

const TARGET_FIELDS: ReadonlyArray<TargetField> = [
  {
    key: "articleNumber",
    label: "Artikelnummer",
    description: "Leverantörens artikelnummer eller SKU.",
  },
  {
    key: "name",
    label: "Namn",
    description: "Produktnamn som används i katalog.",
  },
  {
    key: "ean",
    label: "EAN",
    description: "Globalt EAN-/GTIN-värde för artikeln.",
  },
  {
    key: "brand",
    label: "Varumärke",
    description: "Varumärke eller tillverkare.",
  },
  {
    key: "price",
    label: "Pris",
    description: "Prisvärde från leverantören.",
  },
];

const SAMPLE_CSV = `Art.nr;Benämning;EAN-kod;Leverantör;Pris SEK;Färg;Vikt gram
A-1001;Skruvdragare 18V kompakt;7312345678901;Nordic Tools AB;1299,00;Blå;1450
A-1002;Bitssats PH/PZ 32 delar;7312345678902;Nordic Tools AB;169,00;Svart;420
B-2044;Vinkelslip 125mm Pro;7350011122334;FIWE Industrial Oy;899,00;Röd;2100
X-7788;Installationskabel 3G1,5 100m;7399911223344;ElGrossisten Norden;1190,00;Vit;5600`;

function detectDelimiter(headerLine: string): string {
  const delimiterCandidates: Array<{ delimiter: string; count: number }> = [
    { delimiter: ";", count: headerLine.split(";").length - 1 },
    { delimiter: ",", count: headerLine.split(",").length - 1 },
    { delimiter: "\t", count: headerLine.split("\t").length - 1 },
  ];

  const best = delimiterCandidates.reduce((currentBest, candidate) =>
    candidate.count > currentBest.count ? candidate : currentBest,
  );
  return best.count > 0 ? best.delimiter : ";";
}

function parseCsvValueRows(input: string, delimiter: string): Array<Array<string>> {
  const rows: Array<Array<string>> = [];
  let currentRow: Array<string> = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"') {
      const nextChar = input[index + 1];
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      currentRow.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && input[index + 1] === "\n") {
        index += 1;
      }
      currentRow.push(currentValue.trim());
      currentValue = "";
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function parseCsvText(input: string): ParsedCsv {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Klistra in CSV-data eller ladda upp en fil först.");
  }

  const firstLine = trimmed.split(/\r?\n/)[0] ?? "";
  const delimiter = detectDelimiter(firstLine);
  const parsedRows = parseCsvValueRows(trimmed, delimiter);
  if (parsedRows.length < 2) {
    throw new Error("CSV behöver rubrikrad och minst en datarad.");
  }

  const headers = parsedRows[0].map((header, index) => {
    const cleanHeader = header.trim();
    return cleanHeader.length > 0 ? cleanHeader : `Kolumn ${index + 1}`;
  });
  const rows = parsedRows.slice(1).map((row) =>
    headers.map((_, index) => {
      const rawValue = row[index] ?? "";
      return rawValue.trim();
    }),
  );
  const hasNonEmptyRow = rows.some((row) => row.some((cell) => cell.length > 0));
  if (!hasNonEmptyRow) {
    throw new Error("CSV innehåller inga datavärden.");
  }

  return {
    delimiter,
    headers,
    rows,
  };
}

function toPercent(value: number): string {
  return `${Math.round(value * 100)} %`;
}

function toScore(value: number): string {
  return value.toFixed(2);
}

function JevMappningRoute() {
  const [csvText, setCsvText] = useState("");
  const [sourceKind, setSourceKind] = useState<"sample" | "custom" | null>(null);
  const [isRunningMapping, setIsRunningMapping] = useState(false);
  const [isRunningCategory, setIsRunningCategory] = useState(false);
  const [mappingResult, setMappingResult] = useState<MappingResponse | null>(null);
  const [categoryResult, setCategoryResult] = useState<CategoryResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const runMapping = useAction(selectMappingsAction);
  const runCategory = useAction(classifySampleAction);

  const csvState = useMemo(() => {
    if (!csvText.trim()) {
      return { parsed: null, parseError: null as string | null };
    }

    try {
      const parsed = parseCsvText(csvText);
      return { parsed, parseError: null as string | null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunde inte läsa CSV.";
      return { parsed: null, parseError: message };
    }
  }, [csvText]);

  const mappingByField = useMemo(() => {
    const map = new Map<string, MappingRow>();
    for (const mapping of mappingResult?.mappings ?? []) {
      map.set(mapping.targetField, mapping);
    }
    return map;
  }, [mappingResult]);

  const mappedPreviewRows = useMemo(() => {
    if (!csvState.parsed || !mappingResult) {
      return [];
    }

    const headerIndex = new Map<string, number>();
    csvState.parsed.headers.forEach((header, index) => {
      if (!headerIndex.has(header)) {
        headerIndex.set(header, index);
      }
    });

    return csvState.parsed.rows.slice(0, 3).map((row, rowIndex) => {
      const values: Record<TargetField["key"], string> = {
        articleNumber: "",
        name: "",
        ean: "",
        brand: "",
        price: "",
      };

      for (const target of TARGET_FIELDS) {
        const mapping = mappingByField.get(target.key);
        const selectedHeader = mapping?.selectedSourceHeader;
        if (!selectedHeader) {
          values[target.key] = "";
          continue;
        }
        const index = headerIndex.get(selectedHeader);
        values[target.key] = index === undefined ? "" : row[index] ?? "";
      }

      return {
        rowIndex,
        values,
      };
    });
  }, [csvState.parsed, mappingByField, mappingResult]);

  function handleLoadSample(): void {
    setCsvText(SAMPLE_CSV);
    setSourceKind("sample");
    setErrorText(null);
    setMappingResult(null);
    setCategoryResult(null);
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    setCsvText(text);
    setSourceKind("custom");
    setErrorText(null);
    setMappingResult(null);
    setCategoryResult(null);
  }

  async function handleRunMapping(): Promise<void> {
    setErrorText(null);
    setCategoryResult(null);

    if (!convexConfigured) {
      setErrorText("Convex är inte konfigurerat. Sätt VITE_CONVEX_URL och starta Convex dev.");
      return;
    }

    if (!csvState.parsed) {
      setErrorText(csvState.parseError ?? "CSV kunde inte läsas.");
      return;
    }

    setIsRunningMapping(true);
    try {
      const response = await runMapping({
        sourceHeaders: csvState.parsed.headers,
        sampleRows: csvState.parsed.rows.slice(0, 6),
        targetFields: TARGET_FIELDS.map((field) => ({
          key: field.key,
          label: field.label,
          description: field.description,
        })),
      });
      setMappingResult(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mappningen misslyckades.";
      setErrorText(message);
    } finally {
      setIsRunningMapping(false);
    }
  }

  async function handleRunCategoryDemo(): Promise<void> {
    setErrorText(null);
    if (!csvState.parsed || !mappingResult) {
      setErrorText("Kör fältmappningen först.");
      return;
    }

    const firstRow = csvState.parsed.rows[0];
    if (!firstRow) {
      setErrorText("CSV saknar datarad för klassificering.");
      return;
    }

    const headerIndex = new Map<string, number>();
    csvState.parsed.headers.forEach((header, index) => {
      if (!headerIndex.has(header)) {
        headerIndex.set(header, index);
      }
    });

    const product = {
      articleNumber: "",
      name: "",
      ean: "",
      brand: "",
      price: "",
    };

    for (const field of TARGET_FIELDS) {
      const selectedHeader = mappingByField.get(field.key)?.selectedSourceHeader;
      if (!selectedHeader) {
        continue;
      }
      const index = headerIndex.get(selectedHeader);
      if (index === undefined) {
        continue;
      }
      const value = firstRow[index] ?? "";
      product[field.key] = value;
    }

    setIsRunningCategory(true);
    try {
      const response = await runCategory({ product });
      setCategoryResult(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Klassificeringen misslyckades.";
      setErrorText(message);
    } finally {
      setIsRunningCategory(false);
    }
  }

  return (
    <section className={styles.surface}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Formatkross / field mapping</p>
          <h1>Jev-mappning</h1>
          <p className={styles.lead}>
            Jev är <strong>inte</strong> en Onboarder-ersättare och <strong>inte</strong> en generativ LLM.
            Koden föreslår kandidater. Jev väljer med typed Choice (+ Score) och sannolikheter.
          </p>
          <p className={styles.lead}>
            Sweet spot: snabb remappning av CSV/JSON och hierarkisk klassning i ett litet träd.
          </p>
        </header>

        <article className={styles.card}>
          <div className={styles.cardTop}>
            <h2>1) Ladda in leverantörs-CSV</h2>
            {sourceKind === "sample" ? <span className={styles.sampleBadge}>Exempeldata aktiv</span> : null}
          </div>

          <p className={styles.muted}>
            Demo-CSV innehåller medvetet rubriker som inte matchar målmodellen 1:1.
          </p>

          <div className={styles.actionRow}>
            <button type="button" className={styles.primaryButton} onClick={() => void handleLoadSample()}>
              Ladda exempeldataset
            </button>
            <label className={styles.fileButton}>
              Ladda upp CSV-fil
              <input type="file" accept=".csv,text/csv" onChange={(event) => void handleFileUpload(event)} />
            </label>
          </div>

          <label className={styles.label} htmlFor="jevmappning-csv-input">
            Klistra in CSV
          </label>
          <textarea
            id="jevmappning-csv-input"
            className={styles.textarea}
            value={csvText}
            onChange={(event) => {
              setCsvText(event.target.value);
              setSourceKind("custom");
              setMappingResult(null);
              setCategoryResult(null);
            }}
            placeholder="Art.nr;Benämning;EAN-kod;Leverantör;Pris SEK..."
            rows={10}
          />

          {csvState.parsed ? (
            <div className={styles.csvInfo}>
              <p>
                Rubriker: <strong>{csvState.parsed.headers.length}</strong> • Rader:{" "}
                <strong>{csvState.parsed.rows.length}</strong> • Avgränsare:{" "}
                <code>{csvState.parsed.delimiter === "\t" ? "TAB" : csvState.parsed.delimiter}</code>
              </p>
              <div className={styles.headerPills}>
                {csvState.parsed.headers.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.targetBox}>
            <h3>Målfält (Fiwe-lik modell)</h3>
            <ul>
              {TARGET_FIELDS.map((field) => (
                <li key={field.key}>
                  <strong>{field.label}</strong>
                  <span>{field.key}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void handleRunMapping()}
            disabled={isRunningMapping}
          >
            {isRunningMapping ? "Kör Jev-mappning..." : "2) Kör Jev-mappning"}
          </button>
        </article>

        {errorText ? (
          <article className={`${styles.card} ${styles.errorCard}`}>
            <h2>Fel</h2>
            <p>{errorText}</p>
          </article>
        ) : null}

        {mappingResult ? (
          <article className={styles.card}>
            <div className={styles.cardTop}>
              <h2>Resultat: Jev-val per målfält</h2>
              <span className={styles.modelChip}>Model: {mappingResult.model}</span>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.mappingTable}>
                <thead>
                  <tr>
                    <th>Målfält</th>
                    <th>Vald källa</th>
                    <th>Confidence</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingResult.mappings.map((mapping) => {
                    const lowConfidence = mapping.confidence < HUMAN_REVIEW_THRESHOLD;
                    return (
                      <tr key={mapping.targetField} className={lowConfidence ? styles.lowConfidenceRow : undefined}>
                        <td>
                          <strong>{mapping.targetLabel}</strong>
                          <span>{mapping.targetField}</span>
                        </td>
                        <td>{mapping.selectedSourceHeader ?? "Ingen mappning"}</td>
                        <td>{toPercent(mapping.confidence)}</td>
                        <td>
                          {toScore(mapping.score)}{" "}
                          <small className={styles.inlineSmall}>
                            (conf {toPercent(mapping.scoreConfidence)})
                          </small>
                        </td>
                        <td>
                          {mapping.needsHuman ? (
                            <span className={styles.humanBadge}>Behöver människa</span>
                          ) : (
                            <span className={styles.autoBadge}>Autoval</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.probabilityGrid}>
              {mappingResult.mappings.map((mapping) => (
                <section key={`${mapping.targetField}-prob`} className={styles.probabilityCard}>
                  <h3>{mapping.targetLabel}</h3>
                  <ul>
                    {mapping.probabilities.slice(0, 3).map((candidate) => (
                      <li key={`${mapping.targetField}-${candidate.candidateKey}`}>
                        <span>{candidate.sourceHeader ?? "Ingen mappning"}</span>
                        <strong>{toPercent(candidate.probability)}</strong>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            {mappedPreviewRows.length > 0 ? (
              <>
                <h3>Radpreview efter mappning</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Rad</th>
                        {TARGET_FIELDS.map((field) => (
                          <th key={field.key}>{field.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mappedPreviewRows.map((previewRow) => (
                        <tr key={previewRow.rowIndex}>
                          <td>{previewRow.rowIndex + 1}</td>
                          {TARGET_FIELDS.map((field) => (
                            <td key={`${previewRow.rowIndex}-${field.key}`}>
                              {previewRow.values[field.key] || <em>—</em>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </article>
        ) : null}

        {mappingResult ? (
          <article className={styles.card}>
            <div className={styles.cardTop}>
              <h2>Bonus: 3) Hierarkisk klassificering</h2>
              {categoryResult ? <span className={styles.modelChip}>Model: {categoryResult.model}</span> : null}
            </div>
            <p className={styles.muted}>
              Samma mönster: koden föreslår kandidater i ett litet kategoriträd och Jev väljer nivå för nivå.
            </p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => void handleRunCategoryDemo()}
              disabled={isRunningCategory}
            >
              {isRunningCategory ? "Klassificerar..." : "Klassificera första produkten"}
            </button>

            {categoryResult ? (
              <div className={styles.categoryGrid}>
                {categoryResult.levels.map((level) => {
                  const needsHuman = level.confidence < HUMAN_REVIEW_THRESHOLD || level.selectedKey === "none";
                  return (
                    <article key={level.level} className={needsHuman ? styles.categoryWarn : styles.categoryOk}>
                      <h3>{level.levelName}</h3>
                      <p>{level.selectedLabel}</p>
                      <span>Confidence: {toPercent(level.confidence)}</span>
                    </article>
                  );
                })}
                <article className={categoryResult.needsHuman ? styles.categoryWarn : styles.categoryOk}>
                  <h3>Kvalitetsscore</h3>
                  <p>{toScore(categoryResult.qualityScore)}</p>
                  <span>Confidence: {toPercent(categoryResult.qualityConfidence)}</span>
                </article>
              </div>
            ) : null}
          </article>
        ) : null}

        <article className={styles.card}>
          <h2>Så funkar det</h2>
          <ol className={styles.steps}>
            <li>Koden läser CSV-rubriker och bygger kandidat-mappningar.</li>
            <li>Jev får endast välja bland kandidaterna via typed Choice (+ Score).</li>
            <li>
              Confidence under {toPercent(HUMAN_REVIEW_THRESHOLD)} flaggas som <strong>Behöver människa</strong>.
            </li>
            <li>Ingen generativ text används för beslutet; urvalet är explicit och kontrollerat i kod.</li>
          </ol>
          <p className={styles.muted}>
            Läs mer:{" "}
            <a href="https://docs.typesafe.ai/" target="_blank" rel="noreferrer">
              docs.typesafe.ai
            </a>
          </p>
        </article>
      </div>
    </section>
  );
}
