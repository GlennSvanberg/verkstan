"use node";

import { choice, score, TypeSafeClient } from "@typesafe-ai/sdk";
import { v } from "convex/values";
import { action } from "./_generated/server";

const NO_SELECTION_KEY = "none";
const HUMAN_REVIEW_CONFIDENCE = 0.7;

const mappingCandidateValidator = v.object({
  candidateKey: v.string(),
  sourceHeader: v.union(v.string(), v.null()),
  probability: v.number(),
});

const mappingValidator = v.object({
  targetField: v.string(),
  targetLabel: v.string(),
  selectedCandidateKey: v.string(),
  selectedSourceHeader: v.union(v.string(), v.null()),
  confidence: v.number(),
  score: v.number(),
  scoreConfidence: v.number(),
  needsHuman: v.boolean(),
  probabilities: v.array(mappingCandidateValidator),
});

const categoryCandidateValidator = v.object({
  candidateKey: v.string(),
  label: v.string(),
  probability: v.number(),
});

const categoryLevelValidator = v.object({
  level: v.number(),
  levelName: v.string(),
  selectedKey: v.string(),
  selectedLabel: v.string(),
  confidence: v.number(),
  probabilities: v.array(categoryCandidateValidator),
});

type ChoiceAnswer = {
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
};

type ScoreAnswer = {
  score: number;
  confidence: number;
  probabilities: Record<string, number>;
};

type CategoryCandidate = {
  key: string;
  label: string;
  description: string;
};

function ensureTypeSafeClient(): TypeSafeClient {
  const apiKey = process.env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Servern saknar TYPESAFE_API_KEY. Lägg in variabeln i miljön och försök igen.");
  }

  return new TypeSafeClient({ apiKey });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Ogiltigt svar från TypeSafe: ${label} måste vara ett tal.`);
  }
  return value;
}

function parseProbabilityRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    throw new Error("Ogiltigt svar från TypeSafe: probabilities saknas.");
  }

  const probabilities: Record<string, number> = {};
  for (const [key, rawProbability] of Object.entries(value)) {
    if (typeof rawProbability !== "number" || !Number.isFinite(rawProbability)) {
      continue;
    }
    probabilities[key] = rawProbability;
  }
  return probabilities;
}

function parseChoiceAnswer(value: unknown): ChoiceAnswer {
  if (!isRecord(value) || value.type !== "choice") {
    throw new Error("Ogiltigt svar från TypeSafe: väntade ett Choice-svar.");
  }
  if (typeof value.choice !== "string") {
    throw new Error("Ogiltigt svar från TypeSafe: choice saknar etikett.");
  }
  return {
    choice: value.choice,
    confidence: parseFiniteNumber(value.confidence, "choice.confidence"),
    probabilities: parseProbabilityRecord(value.probabilities),
  };
}

function parseScoreAnswer(value: unknown): ScoreAnswer {
  if (!isRecord(value) || value.type !== "score") {
    throw new Error("Ogiltigt svar från TypeSafe: väntade ett Score-svar.");
  }
  return {
    score: parseFiniteNumber(value.score, "score.score"),
    confidence: parseFiniteNumber(value.confidence, "score.confidence"),
    probabilities: parseProbabilityRecord(value.probabilities),
  };
}

function toMappingProbabilities(
  probabilities: Record<string, number>,
  headerByCandidate: Record<string, string | null>,
): Array<{ candidateKey: string; sourceHeader: string | null; probability: number }> {
  return Object.entries(probabilities)
    .map(([candidateKey, probability]) => ({
      candidateKey,
      sourceHeader: headerByCandidate[candidateKey] ?? null,
      probability,
    }))
    .sort((left, right) => right.probability - left.probability)
    .slice(0, 5);
}

function toCategoryProbabilities(
  probabilities: Record<string, number>,
  labelByCandidate: Record<string, string>,
): Array<{ candidateKey: string; label: string; probability: number }> {
  return Object.entries(probabilities)
    .map(([candidateKey, probability]) => ({
      candidateKey,
      label: labelByCandidate[candidateKey] ?? candidateKey,
      probability,
    }))
    .sort((left, right) => right.probability - left.probability)
    .slice(0, 5);
}

async function askCategoryChoice(
  client: TypeSafeClient,
  params: {
    state: Record<string, unknown>;
    question: string;
    candidates: Array<CategoryCandidate>;
  },
): Promise<{
  model: string;
  answer: ChoiceAnswer;
  labelByCandidate: Record<string, string>;
}> {
  const criteria: Record<string, string | null> = {
    [NO_SELECTION_KEY]: "Ingen kandidat passar tillräckligt bra.",
  };
  const labelByCandidate: Record<string, string> = {
    [NO_SELECTION_KEY]: "Ingen passande kategori",
  };

  for (const candidate of params.candidates) {
    criteria[candidate.key] = candidate.description;
    labelByCandidate[candidate.key] = candidate.label;
  }

  const response = await client.systemOne({
    state: params.state,
    questions: {
      category: choice(params.question, criteria),
    },
  });

  const answers = response.answers as Record<string, unknown>;
  return {
    model: response.model,
    answer: parseChoiceAnswer(answers.category),
    labelByCandidate,
  };
}

export const jevmappning_selectFieldMappings = action({
  args: {
    sourceHeaders: v.array(v.string()),
    sampleRows: v.array(v.array(v.string())),
    targetFields: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        description: v.string(),
      }),
    ),
  },
  returns: v.object({
    model: v.string(),
    mappings: v.array(mappingValidator),
  }),
  handler: async (_ctx, args) => {
    const sourceHeaders = args.sourceHeaders.map((header) => header.trim()).filter((header) => header.length > 0);
    if (sourceHeaders.length === 0) {
      throw new Error("CSV-filen saknar rubriker.");
    }
    if (args.targetFields.length === 0) {
      throw new Error("Målmodellen saknar fält.");
    }

    const client = ensureTypeSafeClient();
    const mappingQuestions: Record<string, ReturnType<typeof choice> | ReturnType<typeof score>> = {};
    const headersPerTarget: Record<string, Record<string, string | null>> = {};

    for (const targetField of args.targetFields) {
      const candidates: Record<string, string | null> = {
        [NO_SELECTION_KEY]: null,
      };

      for (const [index, sourceHeader] of sourceHeaders.entries()) {
        candidates[`h_${index}`] = sourceHeader;
      }

      headersPerTarget[targetField.key] = candidates;
      mappingQuestions[`map_${targetField.key}`] = choice(
        {
          task: "Select the best source header for this target field.",
          targetField: targetField.key,
          targetDescription: targetField.description,
          policy: "Prefer none when no source header is a trustworthy fit.",
        },
        Object.fromEntries(
          Object.entries(candidates).map(([candidateKey, sourceHeader]) => [
            candidateKey,
            sourceHeader
              ? { sourceHeader, guidance: `Use this header if it maps cleanly to ${targetField.key}.` }
              : "Use this when no source header is a reliable mapping.",
          ]),
        ),
      );
      mappingQuestions[`score_${targetField.key}`] = score(
        {
          task: "Rate mapping quality for the selected candidate.",
          targetField: targetField.key,
          rubric: "0 poor fit, 1 usable with review, 2 strong fit",
        },
        [
          "Poor fit. Should probably be reviewed by a human before use.",
          "Possible fit. Could work, but should be manually checked.",
          "Strong fit. High chance this mapping is correct.",
        ],
      );
    }

    try {
      const response = await client.systemOne({
        state: {
          sourceHeaders,
          sampleRows: args.sampleRows.slice(0, 6),
          targetFields: args.targetFields,
        },
        questions: mappingQuestions,
      });

      const answers = response.answers as Record<string, unknown>;
      const mappings = args.targetFields.map((targetField) => {
        const choiceAnswer = parseChoiceAnswer(answers[`map_${targetField.key}`]);
        const scoreAnswer = parseScoreAnswer(answers[`score_${targetField.key}`]);
        const headersByCandidate = headersPerTarget[targetField.key] ?? {};
        const selectedSourceHeader =
          choiceAnswer.choice === NO_SELECTION_KEY ? null : headersByCandidate[choiceAnswer.choice] ?? null;
        const needsHuman =
          choiceAnswer.choice === NO_SELECTION_KEY ||
          choiceAnswer.confidence < HUMAN_REVIEW_CONFIDENCE ||
          scoreAnswer.confidence < HUMAN_REVIEW_CONFIDENCE;

        return {
          targetField: targetField.key,
          targetLabel: targetField.label,
          selectedCandidateKey: choiceAnswer.choice,
          selectedSourceHeader,
          confidence: choiceAnswer.confidence,
          score: scoreAnswer.score,
          scoreConfidence: scoreAnswer.confidence,
          needsHuman,
          probabilities: toMappingProbabilities(choiceAnswer.probabilities, headersByCandidate),
        };
      });

      return {
        model: response.model,
        mappings,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Okänt TypeSafe-fel.";
      throw new Error(`TypeSafe-anropet misslyckades: ${message}`);
    }
  },
});

export const jevmappning_classifySampleProduct = action({
  args: {
    product: v.object({
      articleNumber: v.string(),
      name: v.string(),
      ean: v.string(),
      brand: v.string(),
      price: v.string(),
    }),
  },
  returns: v.object({
    model: v.string(),
    levels: v.array(categoryLevelValidator),
    qualityScore: v.number(),
    qualityConfidence: v.number(),
    needsHuman: v.boolean(),
  }),
  handler: async (_ctx, args) => {
    const client = ensureTypeSafeClient();

    const levelOneCandidates: Array<CategoryCandidate> = [
      { key: "power_tools", label: "Elverktyg", description: "Elektriska verktyg för montage och bearbetning." },
      { key: "hand_tools", label: "Handverktyg", description: "Manuella handverktyg utan motor." },
      {
        key: "electrical_installation",
        label: "Elinstallation",
        description: "Komponenter för eldragning, kapsling och anslutning.",
      },
    ];

    const levelTwoTree: Record<string, Array<CategoryCandidate>> = {
      power_tools: [
        { key: "drills", label: "Borr/skruv", description: "Borr- eller skruvdrivande elverktyg." },
        { key: "grinders", label: "Slip/kap", description: "Slip- eller kapverktyg med roterande skiva." },
      ],
      hand_tools: [
        { key: "screwdrivers", label: "Skruvmejslar", description: "Mejslar, bits och tillhörande handverktyg." },
        { key: "pliers", label: "Tänger", description: "Grip-, press- eller klippverktyg av tång-typ." },
      ],
      electrical_installation: [
        { key: "cables", label: "Kabel", description: "Kablar och ledare för installation." },
        { key: "enclosures", label: "Kapsling", description: "Kapslingar, dosor och skyddslösningar." },
      ],
    };

    const levelThreeTree: Record<string, Array<CategoryCandidate>> = {
      drills: [
        { key: "drills_18v", label: "Skruvdragare 18V", description: "Batteridrivna 18V borr/skruvverktyg." },
        { key: "drills_12v", label: "Skruvdragare 12V", description: "Kompakta 12V borr/skruvverktyg." },
      ],
      grinders: [
        { key: "grinders_125", label: "Vinkelslip 125 mm", description: "Vinkelslipar med 125 mm skiva." },
        { key: "grinders_230", label: "Vinkelslip 230 mm", description: "Vinkelslipar med 230 mm skiva." },
      ],
      screwdrivers: [
        { key: "bits_sets", label: "Bitssats", description: "Bitssatser och relaterade mejseltillbehör." },
        { key: "precision_sets", label: "Precisionsmejsel", description: "Små precisionsmejslar och set." },
      ],
      pliers: [
        { key: "combination_pliers", label: "Kombitång", description: "Allround kombitänger." },
        { key: "cutting_pliers", label: "Avbitare", description: "Avbitare och sidavbitare." },
      ],
      cables: [
        { key: "installation_cables", label: "Installationskabel", description: "Kabel för fast elinstallation." },
        { key: "network_cables", label: "Nätverkskabel", description: "Kabel för data- och nätverkstrafik." },
      ],
      enclosures: [
        { key: "outdoor_enclosures", label: "Utomhuskapsling", description: "Kapsling med skydd för utomhusmiljö." },
        { key: "industrial_enclosures", label: "Industrikapsling", description: "Robust kapsling för industriell miljö." },
      ],
    };

    try {
      const levels: Array<{
        level: number;
        levelName: string;
        selectedKey: string;
        selectedLabel: string;
        confidence: number;
        probabilities: Array<{ candidateKey: string; label: string; probability: number }>;
      }> = [];

      const levelOne = await askCategoryChoice(client, {
        state: {
          product: args.product,
          level: 1,
          allowedCategories: levelOneCandidates.map((candidate) => candidate.label),
        },
        question: "Select the best level-1 category for this product.",
        candidates: levelOneCandidates,
      });

      levels.push({
        level: 1,
        levelName: "Nivå 1",
        selectedKey: levelOne.answer.choice,
        selectedLabel: levelOne.labelByCandidate[levelOne.answer.choice] ?? levelOne.answer.choice,
        confidence: levelOne.answer.confidence,
        probabilities: toCategoryProbabilities(levelOne.answer.probabilities, levelOne.labelByCandidate),
      });

      let model = levelOne.model;
      if (levelOne.answer.choice !== NO_SELECTION_KEY) {
        const levelTwoCandidates = levelTwoTree[levelOne.answer.choice] ?? [];
        if (levelTwoCandidates.length > 0) {
          const levelTwo = await askCategoryChoice(client, {
            state: {
              product: args.product,
              level: 2,
              parentCategory: levelOne.answer.choice,
              allowedCategories: levelTwoCandidates.map((candidate) => candidate.label),
            },
            question: "Select the best level-2 category for this product.",
            candidates: levelTwoCandidates,
          });

          model = levelTwo.model;
          levels.push({
            level: 2,
            levelName: "Nivå 2",
            selectedKey: levelTwo.answer.choice,
            selectedLabel: levelTwo.labelByCandidate[levelTwo.answer.choice] ?? levelTwo.answer.choice,
            confidence: levelTwo.answer.confidence,
            probabilities: toCategoryProbabilities(levelTwo.answer.probabilities, levelTwo.labelByCandidate),
          });

          if (levelTwo.answer.choice !== NO_SELECTION_KEY) {
            const levelThreeCandidates = levelThreeTree[levelTwo.answer.choice] ?? [];
            if (levelThreeCandidates.length > 0) {
              const levelThree = await askCategoryChoice(client, {
                state: {
                  product: args.product,
                  level: 3,
                  parentCategory: levelTwo.answer.choice,
                  allowedCategories: levelThreeCandidates.map((candidate) => candidate.label),
                },
                question: "Select the best level-3 category for this product.",
                candidates: levelThreeCandidates,
              });

              model = levelThree.model;
              levels.push({
                level: 3,
                levelName: "Nivå 3",
                selectedKey: levelThree.answer.choice,
                selectedLabel: levelThree.labelByCandidate[levelThree.answer.choice] ?? levelThree.answer.choice,
                confidence: levelThree.answer.confidence,
                probabilities: toCategoryProbabilities(levelThree.answer.probabilities, levelThree.labelByCandidate),
              });
            }
          }
        }
      }

      const qualityResponse = await client.systemOne({
        state: {
          product: args.product,
          selectedPath: levels.map((level) => level.selectedLabel),
        },
        questions: {
          quality: score(
            "Rate how trustworthy this hierarchical classification path is.",
            [
              "Weak fit: should absolutely be reviewed by a human.",
              "Mixed fit: useful hint, but should be verified by a human.",
              "Strong fit: likely safe to accept with minimal review.",
            ],
          ),
        },
      });

      const qualityAnswer = parseScoreAnswer((qualityResponse.answers as Record<string, unknown>).quality);
      const needsHuman =
        qualityAnswer.confidence < HUMAN_REVIEW_CONFIDENCE ||
        levels.some((level) => level.selectedKey === NO_SELECTION_KEY || level.confidence < HUMAN_REVIEW_CONFIDENCE);

      return {
        model,
        levels,
        qualityScore: qualityAnswer.score,
        qualityConfidence: qualityAnswer.confidence,
        needsHuman,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Okänt TypeSafe-fel.";
      throw new Error(`TypeSafe-anropet misslyckades: ${message}`);
    }
  },
});
