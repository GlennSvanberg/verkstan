import { type FormEvent, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./index.module.css";

export const Route = createFileRoute("/apps/pimvaggen/")({
  component: PimVaggenRoute,
});

type WallNodeType =
  | "root"
  | "kpiRow"
  | "statusFunnel"
  | "changeList"
  | "dqCard"
  | "actionPanel"
  | "missingEanList"
  | "masterPulse"
  | "writePreview"
  | "promptInsight";

type WallBindKey =
  | "kpis"
  | "funnel"
  | "changes"
  | "dqFindings"
  | "missingEanRows"
  | "masterPulse"
  | "previewRows"
  | "promptInsight";

type WallNode = {
  id: string;
  parentId: string | null;
  type: WallNodeType;
  props?: {
    title?: string;
  };
  $bind?: WallBindKey;
};

type Kpi = {
  label: string;
  value: string;
  hint: string;
};

type FunnelStage = {
  label: string;
  count: number;
};

type ChangeRow = {
  identifier: string;
  update: string;
  owner: string;
  when: string;
};

type DqFinding = {
  rule: string;
  objectId: string;
  message: string;
};

type MissingEanRow = {
  objectId: string;
  supplierAid: string;
  owner: string;
};

type PreviewRow = {
  field: string;
  before: string;
  after: string;
};

type PromptInsight = {
  title: string;
  lines: Array<string>;
};

type WallValue = {
  kpis: Array<Kpi>;
  funnel: Array<FunnelStage>;
  changes: Array<ChangeRow>;
  dqFindings: Array<DqFinding>;
  missingEanRows: Array<MissingEanRow>;
  masterPulse: Array<string>;
  previewRows: Array<PreviewRow>;
  promptInsight: PromptInsight;
};

const demoBannerText = "Exempeldata / mock";

// Local fallback renderer for a Syntux-like RIS shape (id/parentId/type/props/$bind).
// It keeps the value + layout contract, but without live LLM generation or API keys.
const defaultWallSchema: ReadonlyArray<WallNode> = [
  { id: "root", parentId: null, type: "root" },
  { id: "kpi", parentId: "root", type: "kpiRow", props: { title: "Morgon-KPI" }, $bind: "kpis" },
  {
    id: "funnel",
    parentId: "root",
    type: "statusFunnel",
    props: { title: "Statusflöde" },
    $bind: "funnel",
  },
  {
    id: "changes",
    parentId: "root",
    type: "changeList",
    props: { title: "Ändringar senaste timmen" },
    $bind: "changes",
  },
  { id: "dq", parentId: "root", type: "dqCard", props: { title: "DQ-bevis" }, $bind: "dqFindings" },
  {
    id: "actions",
    parentId: "root",
    type: "actionPanel",
    props: { title: "Stängda åtgärder (mock)" },
  },
];

const defaultWallValue: WallValue = {
  kpis: [
    { label: "Produkter i MASTER", value: "12 480", hint: "Mockad snapshotsiffra 07:00" },
    { label: "Ändringar senaste timmen", value: "186", hint: "Mockad trend +8 %" },
    { label: "Duplicate GTIN", value: "14", hint: "Exempeldata, ej live" },
    { label: "Saknade EAN", value: "37", hint: "Exempeldata, ej live" },
  ],
  funnel: [
    { label: "New", count: 140 },
    { label: "Enriched", count: 122 },
    { label: "Ready for QA", count: 98 },
    { label: "Approved", count: 72 },
    { label: "Output released", count: 55 },
  ],
  changes: [
    { identifier: "DEMO-0601", update: "Pris justerat i nordisk kanal", owner: "team-intake", when: "06:42" },
    { identifier: "DEMO-0614", update: "Nya bilder i artikelpaket", owner: "team-media", when: "06:31" },
    { identifier: "DEMO-0622", update: "Status -> Ready for QA", owner: "team-pim", when: "06:27" },
    { identifier: "DEMO-0628", update: "GTIN-konflikt markerad", owner: "team-dq", when: "06:16" },
    { identifier: "DEMO-0633", update: "Saknad svensk korttext", owner: "team-copy", when: "06:02" },
    { identifier: "Resten", update: "Ytterligare 179 objekt", owner: "samlat", when: "senaste timmen" },
  ],
  dqFindings: [
    { rule: "duplicate_gtin", objectId: "DEMO-0628", message: "GTIN 0731001009932 finns redan på DEMO-0551." },
    { rule: "missing_ean", objectId: "DEMO-0617", message: "EAN saknas på huvudartikel i MASTER." },
    { rule: "missing_sv_description", objectId: "DEMO-0633", message: "Svensk kortbeskrivning är tom (lang 29)." },
  ],
  missingEanRows: [
    { objectId: "DEMO-0617", supplierAid: "A-40017", owner: "team-intake" },
    { objectId: "DEMO-0641", supplierAid: "A-40041", owner: "team-intake" },
    { objectId: "DEMO-0650", supplierAid: "A-40050", owner: "team-onboard" },
    { objectId: "DEMO-0662", supplierAid: "A-40062", owner: "team-onboard" },
  ],
  masterPulse: [
    "MASTER har stabil takt med fler uppdateringar än blockerare.",
    "Största risk i mockläget: saknade EAN i intake-spåret.",
    "Rekommenderad nästa vy: lista saknade EAN och öppna toppobjekt.",
  ],
  previewRows: [
    { field: "Product2GLang.DescriptionShort(29)", before: " ", after: "Ny svensk korttext (mock)" },
    {
      field: "ArticleStructureMap.StructureGroup",
      before: "168@10000",
      after: "172@10000 (förslag, mock)",
    },
    { field: "Article.EAN", before: "saknas", after: "0731001009932 (mockförslag)" },
  ],
  promptInsight: {
    title: "Frågetolkning (mock)",
    lines: [
      "Frågan tolkades som fri prompt och gav en komponentuppdatering.",
      "Inga livekällor har lästs, endast exempeldata i klienten.",
    ],
  },
};

const dqScenarios: ReadonlyArray<Array<DqFinding>> = [
  defaultWallValue.dqFindings,
  [
    {
      rule: "duplicate_gtin",
      objectId: "DEMO-0670",
      message: "GTIN 0731001008888 krockar mot DEMO-0580.",
    },
    {
      rule: "missing_ean",
      objectId: "DEMO-0650",
      message: "EAN saknas fortfarande efter nattkörning.",
    },
    {
      rule: "article_without_product",
      objectId: "DEMO-0675",
      message: "Artikel saknar kopplat Product2G.",
    },
  ],
];

const promptChips: ReadonlyArray<string> = [
  "visa saknade EAN som lista",
  "hur mår MASTER?",
  "rensa extra kort",
];

function PimVaggenRoute() {
  const [wallSchema, setWallSchema] = useState<Array<WallNode>>([...defaultWallSchema]);
  const [wallValue, setWallValue] = useState<WallValue>(defaultWallValue);
  const [promptText, setPromptText] = useState("");
  const [toastText, setToastText] = useState<string | null>(null);
  const [dqScenarioIndex, setDqScenarioIndex] = useState(0);
  const [showObjectModal, setShowObjectModal] = useState(false);

  useEffect(() => {
    if (!toastText) return;
    const timeoutHandle = window.setTimeout(() => setToastText(null), 2200);
    return () => window.clearTimeout(timeoutHandle);
  }, [toastText]);

  const wallNodes = useMemo(
    () => wallSchema.filter((node) => node.parentId === "root"),
    [wallSchema],
  );

  function showToast(message: string): void {
    setToastText(message);
  }

  function addOrReplaceNode(nextNode: WallNode): void {
    setWallSchema((current) => {
      const withoutSame = current.filter((node) => node.id !== nextNode.id);
      const rootIndex = withoutSame.findIndex((node) => node.id === "root");
      if (rootIndex === -1) {
        return [...withoutSame, nextNode];
      }
      return [...withoutSame.slice(0, rootIndex + 1), ...withoutSame.slice(rootIndex + 1), nextNode];
    });
  }

  function replaceNodeType(typeToReplace: WallNodeType, replacement: WallNode): void {
    setWallSchema((current) => {
      let replaced = false;
      const updated = current.map((node) => {
        if (node.type !== typeToReplace) return node;
        replaced = true;
        return replacement;
      });
      if (replaced) return updated;
      return [...updated, replacement];
    });
  }

  function removeNodeById(nodeId: string): void {
    setWallSchema((current) => current.filter((node) => node.id !== nodeId));
  }

  function runPromptMutation(prompt: string): void {
    const normalizedPrompt = prompt.trim().toLowerCase();
    if (!normalizedPrompt) {
      return;
    }

    if (normalizedPrompt.includes("saknade ean")) {
      addOrReplaceNode({
        id: "missing-ean",
        parentId: "root",
        type: "missingEanList",
        props: { title: "Saknade EAN (lista)" },
        $bind: "missingEanRows",
      });
      showToast("Väggen uppdaterad: visar saknade EAN som lista (mock).");
      return;
    }

    if (normalizedPrompt.includes("hur mår master") || normalizedPrompt.includes("master")) {
      replaceNodeType("statusFunnel", {
        id: "master-pulse",
        parentId: "root",
        type: "masterPulse",
        props: { title: "MASTER-läge" },
        $bind: "masterPulse",
      });
      showToast("Väggen uppdaterad: statusflöde ersatt med MASTER-läge (mock).");
      return;
    }

    if (normalizedPrompt.includes("preview") || normalizedPrompt.includes("skrivning")) {
      replaceNodeType("dqCard", {
        id: "write-preview",
        parentId: "root",
        type: "writePreview",
        props: { title: "Preview-skrivning (ingen commit)" },
        $bind: "previewRows",
      });
      showToast("Väggen uppdaterad: DQ-kort ersatt med skrivningspreview (mock).");
      return;
    }

    if (normalizedPrompt.includes("rensa") || normalizedPrompt.includes("ta bort")) {
      removeNodeById("missing-ean");
      removeNodeById("prompt-insight");
      showToast("Väggen uppdaterad: extra kort togs bort (mock).");
      return;
    }

    setWallValue((current) => ({
      ...current,
      promptInsight: {
        title: "Frågetolkning (mock)",
        lines: [
          `Prompt: "${prompt.trim()}"`,
          "Väggen tolkade frågan och la till en ny insiktsruta.",
          "Ingen chattranskriptpanel öppnades.",
        ],
      },
    }));
    addOrReplaceNode({
      id: "prompt-insight",
      parentId: "root",
      type: "promptInsight",
      props: { title: "Svarsyta för fri prompt" },
      $bind: "promptInsight",
    });
    showToast("Väggen uppdaterad: fri prompt gav en ny komponent (mock).");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const nextPrompt = promptText.trim();
    if (!nextPrompt) return;
    runPromptMutation(nextPrompt);
    setPromptText("");
  }

  function handleRunDq(): void {
    const nextScenario = (dqScenarioIndex + 1) % dqScenarios.length;
    setDqScenarioIndex(nextScenario);
    setWallValue((current) => ({ ...current, dqFindings: dqScenarios[nextScenario] }));
    showToast("Mockad DQ-körning klar. Väggen uppdaterades med ny exempelutdata.");
  }

  function handleShowMissingEan(): void {
    runPromptMutation("visa saknade EAN som lista");
  }

  function handleOpenObject(): void {
    setShowObjectModal(true);
  }

  function handlePreviewWrite(): void {
    runPromptMutation("byt DQ-kort mot skrivningspreview");
  }

  return (
    <section className={styles.surface}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.kicker}>PIM-insyn / dashboard wall</p>
          <div className={styles.heroTop}>
            <h1>PIM-väggen</h1>
            <span className={styles.mockBadge}>{demoBannerText}</span>
          </div>
          <p className={styles.intro}>
            Morgonvägg i Syntux-stil: sidan är svaret, promptremsan muterar komponenter och all data är
            tydligt mockad.
          </p>
        </header>

        <div className={styles.wall}>
          {wallNodes.map((node) => (
            <WallCard
              key={node.id}
              node={node}
              value={wallValue}
              onRunDq={handleRunDq}
              onShowMissingEan={handleShowMissingEan}
              onOpenObject={handleOpenObject}
              onPreviewWrite={handlePreviewWrite}
            />
          ))}
        </div>

        <form className={styles.promptStrip} onSubmit={handleSubmit}>
          <div className={styles.promptHeading}>
            <strong>Promptremsa</strong>
            <span>Fri text muterar väggen (lägg till, byt ut, ta bort komponenter).</span>
          </div>
          <div className={styles.promptInputRow}>
            <input
              type="text"
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
              placeholder="Skriv en fråga eller instruktion..."
              className={styles.promptInput}
            />
            <button type="submit" className={styles.primaryButton}>
              Uppdatera vägg
            </button>
          </div>
          <div className={styles.promptChipRow}>
            {promptChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className={styles.chip}
                onClick={() => runPromptMutation(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </form>
      </div>

      {toastText ? <div className={styles.toast}>{toastText}</div> : null}

      {showObjectModal ? (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => setShowObjectModal(false)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Objektdetaljer"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Objekt: DEMO-0622</h2>
            <p>
              Exempelvisning av objektkort. Ingen live PIM-källa anropades och ingen skrivning har gjorts.
            </p>
            <ul>
              <li>Status: Ready for QA</li>
              <li>Senast ändrad: 06:27</li>
              <li>Ansvarig: team-pim</li>
            </ul>
            <button type="button" className={styles.secondaryButton} onClick={() => setShowObjectModal(false)}>
              Stäng
            </button>
          </section>
        </div>
      ) : null}
    </section>
  );
}

type WallCardProps = {
  node: WallNode;
  value: WallValue;
  onRunDq: () => void;
  onShowMissingEan: () => void;
  onOpenObject: () => void;
  onPreviewWrite: () => void;
};

function WallCard({
  node,
  value,
  onRunDq,
  onShowMissingEan,
  onOpenObject,
  onPreviewWrite,
}: WallCardProps) {
  if (node.type === "kpiRow" && node.$bind === "kpis") {
    return (
      <article className={`${styles.card} ${styles.kpiCard}`}>
        <header>
          <h2>{node.props?.title ?? "KPI"}</h2>
          <p>{demoBannerText}</p>
        </header>
        <div className={styles.kpiGrid}>
          {value.kpis.map((kpi) => (
            <div key={kpi.label} className={styles.kpiTile}>
              <p>{kpi.label}</p>
              <strong>{kpi.value}</strong>
              <span>{kpi.hint}</span>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (node.type === "statusFunnel" && node.$bind === "funnel") {
    const maxCount = Math.max(...value.funnel.map((stage) => stage.count));
    return (
      <article className={styles.card}>
        <header>
          <h2>{node.props?.title ?? "Statusflöde"}</h2>
          <p>{demoBannerText}</p>
        </header>
        <ol className={styles.funnelList}>
          {value.funnel.map((stage) => (
            <li key={stage.label}>
              <div>
                <strong>{stage.label}</strong>
                <span>{stage.count}</span>
              </div>
              <div className={styles.funnelTrack}>
                <span
                  className={styles.funnelFill}
                  style={{ width: `${Math.max((stage.count / maxCount) * 100, 8)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      </article>
    );
  }

  if (node.type === "changeList" && node.$bind === "changes") {
    return (
      <article className={styles.card}>
        <header>
          <h2>{node.props?.title ?? "Ändringslista"}</h2>
          <p>{demoBannerText}</p>
        </header>
        <ul className={styles.changeList}>
          {value.changes.map((row) => (
            <li key={`${row.identifier}-${row.when}`}>
              <div>
                <strong>{row.identifier}</strong>
                <p>{row.update}</p>
              </div>
              <div>
                <span>{row.owner}</span>
                <time>{row.when}</time>
              </div>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  if (node.type === "dqCard" && node.$bind === "dqFindings") {
    return (
      <article className={styles.card}>
        <header>
          <h2>{node.props?.title ?? "DQ"}</h2>
          <p>{demoBannerText}</p>
        </header>
        <ul className={styles.evidenceList}>
          {value.dqFindings.map((finding) => (
            <li key={`${finding.rule}-${finding.objectId}`}>
              <code>{finding.rule}</code>
              <strong>{finding.objectId}</strong>
              <p>{finding.message}</p>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  if (node.type === "actionPanel") {
    return (
      <article className={`${styles.card} ${styles.actionCard}`}>
        <header>
          <h2>{node.props?.title ?? "Åtgärder"}</h2>
          <p>Stängda mockåtgärder, inga writes</p>
        </header>
        <div className={styles.actionGrid}>
          <button type="button" className={styles.primaryButton} onClick={onRunDq}>
            Kör DQ
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onShowMissingEan}>
            Visa saknade EAN
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onOpenObject}>
            Öppna objekt
          </button>
          <button type="button" className={styles.secondaryButton} onClick={onPreviewWrite}>
            Preview-skrivning
          </button>
        </div>
      </article>
    );
  }

  if (node.type === "missingEanList" && node.$bind === "missingEanRows") {
    return (
      <article className={styles.card}>
        <header>
          <h2>{node.props?.title ?? "Saknade EAN"}</h2>
          <p>{demoBannerText}</p>
        </header>
        <ul className={styles.simpleList}>
          {value.missingEanRows.map((row) => (
            <li key={row.objectId}>
              <strong>{row.objectId}</strong>
              <span>{row.supplierAid}</span>
              <em>{row.owner}</em>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  if (node.type === "masterPulse" && node.$bind === "masterPulse") {
    return (
      <article className={styles.card}>
        <header>
          <h2>{node.props?.title ?? "MASTER-läge"}</h2>
          <p>{demoBannerText}</p>
        </header>
        <ul className={styles.simpleList}>
          {value.masterPulse.map((line) => (
            <li key={line}>
              <p>{line}</p>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  if (node.type === "writePreview" && node.$bind === "previewRows") {
    return (
      <article className={styles.card}>
        <header>
          <h2>{node.props?.title ?? "Preview-skrivning"}</h2>
          <p>Förhandsvisning, ingen commit</p>
        </header>
        <ul className={styles.previewList}>
          {value.previewRows.map((row) => (
            <li key={row.field}>
              <strong>{row.field}</strong>
              <p>
                <span>Före:</span> {row.before}
              </p>
              <p>
                <span>Efter:</span> {row.after}
              </p>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  if (node.type === "promptInsight" && node.$bind === "promptInsight") {
    return (
      <article className={styles.card}>
        <header>
          <h2>{node.props?.title ?? "Prompt-insikt"}</h2>
          <p>{demoBannerText}</p>
        </header>
        <h3 className={styles.insightTitle}>{value.promptInsight.title}</h3>
        <ul className={styles.simpleList}>
          {value.promptInsight.lines.map((line) => (
            <li key={line}>
              <p>{line}</p>
            </li>
          ))}
        </ul>
      </article>
    );
  }

  return null;
}
