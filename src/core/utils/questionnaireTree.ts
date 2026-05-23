import type { IQuestion } from '../models/question';

export const sortQuestionsByDisplayOrder = (items: IQuestion[]): IQuestion[] =>
  [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id);

/**
 * Builds roots + nested `children` from the flat `GET /preguntas/questionnaire/{id}` list.
 * Use when `/tree` is unavailable or returns no data: requires `parentQuestionId` / `displayOrder`
 * on each row (same as DB). Purely client-side.
 */
export const buildQuestionTreeFromFlatList = (flat: IQuestion[]): IQuestion[] => {
  if (!flat.length) return [];

  const sorted = [...flat].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id
  );

  const nodes: IQuestion[] = sorted.map((q) => ({
    ...q,
    children: undefined
  }));

  const byId = new Map<number, IQuestion>();
  nodes.forEach((n) => byId.set(n.id, n));

  const roots: IQuestion[] = [];
  for (const q of nodes) {
    const pid = q.parentQuestionId;
    if (pid == null) {
      roots.push(q);
      continue;
    }
    const parent = byId.get(pid);
    if (!parent) {
      roots.push(q);
      continue;
    }
    if (!parent.children) parent.children = [];
    parent.children.push(q);
  }

  const sortNested = (items: IQuestion[]) => {
    sortQuestionsByDisplayOrder(items).forEach((n) => {
      if (n.children?.length) {
        n.children = sortQuestionsByDisplayOrder(n.children);
        sortNested(n.children);
      }
    });
  };

  const rootOrdered = sortQuestionsByDisplayOrder(roots);
  sortNested(rootOrdered);
  return rootOrdered;
};

/** Pre-order traversal, unique by question id */
export const flattenQuestionTree = (roots: IQuestion[]): IQuestion[] => {
  const out: IQuestion[] = [];
  const seen = new Set<number>();

  const walk = (nodes: IQuestion[]) => {
    sortQuestionsByDisplayOrder(nodes).forEach((n) => {
      if (seen.has(n.id)) return;
      seen.add(n.id);
      out.push(n);
      if (n.children?.length) walk(n.children);
    });
  };

  walk(roots);
  return out;
};

export const buildQuestionMap = (roots: IQuestion[]): Map<number, IQuestion> => {
  const map = new Map<number, IQuestion>();
  flattenQuestionTree(roots).forEach((q) => map.set(q.id, q));
  return map;
};

export const treeHasBranches = (roots: IQuestion[]): boolean => {
  const stack = [...roots];
  while (stack.length) {
    const q = stack.pop()!;
    if (q.children && q.children.length > 0) return true;
    if (q.children) stack.push(...q.children);
  }
  return false;
};

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Generic mapping from section prefixes to option text patterns.
 * This allows the backend to organize children by section without needing
 * to explicitly set parentAnswerTrigger for each child.
 * The mapping uses the section number (e.g., "4.1") to determine which option
 * should trigger the child questions in that section.
 */
const inferTriggerFromSection = (section: string | undefined, parentOptions: IQuestion['options']): string | null => {
  if (!section || !parentOptions?.length) return null;

  // Extract the section prefix (e.g., "4.1" from "4.1.1")
  const sectionPrefix = section.match(/^\d+\.\d+/)?.[0];
  if (!sectionPrefix) return null;

  // Map section prefixes to option indices (0-based)
  // Section 4.1 → option 0, 4.2 → option 1, 4.3 → option 2, 4.4 → option 3
  const sectionNumber = parseInt(sectionPrefix.split('.')[1]);
  const optionIndex = sectionNumber - 1; // 4.1 → index 0, 4.2 → index 1, etc.

  if (optionIndex >= 0 && optionIndex < parentOptions.length) {
    const option = parentOptions[optionIndex];
    // Return the option text as the trigger
    return option.text;
  }

  return null;
};

export const answerMatchesTrigger = (
  trigger: string | undefined,
  answerValues: string[],
  options: IQuestion['options'],
  childSection?: string
): boolean => {
  // If trigger is explicitly set, use it
  if (trigger != null && trigger.trim() !== '') {
    const t = trigger.trim();
    const tLower = norm(t);

    return answerValues.some((raw) => {
      const av = String(raw).trim();
      if (av === t) return true;
      if (norm(av) === tLower) return true;
      const opt = options?.find((o) => String(o.id) === av);
      if (opt) {
        if (String(opt.id) === t) return true;
        if (norm(opt.text) === tLower) return true;
      }
      return false;
    });
  }

  // Generic fallback: if trigger is empty but we have a section, infer the trigger from section
  if (childSection) {
    const inferredTrigger = inferTriggerFromSection(childSection, options);
    if (inferredTrigger) {
      const tLower = norm(inferredTrigger);
      return answerValues.some((raw) => {
        const av = String(raw).trim();
        if (norm(av) === tLower) return true;
        const opt = options?.find((o) => String(o.id) === av);
        if (opt && norm(opt.text) === tLower) return true;
        return false;
      });
    }
  }

  // Fallback: if no trigger and no section, match any non-empty answer
  return answerValues.length > 0;
};

export const matchingChildren = (parent: IQuestion, answerValues: string[]): IQuestion[] => {
  if (!parent.children?.length) return [];
  return sortQuestionsByDisplayOrder(parent.children).filter((child) =>
    answerMatchesTrigger(child.parentAnswerTrigger, answerValues, parent.options, child.section)
  );
};

export const isDescendantOf = (
  q: IQuestion,
  ancestorId: number,
  byId: Map<number, IQuestion>
): boolean => {
  let pid: number | undefined = q.parentQuestionId;
  while (pid != null) {
    if (pid === ancestorId) return true;
    pid = byId.get(pid)?.parentQuestionId;
  }
  return false;
};

/**
 * After the user answers `answeredQuestionId`, drop descendant steps that depended on that answer
 * and insert newly matching children right after the answered question.
 */
export const reconcileQueueAfterAnswer = (
  queue: IQuestion[],
  answeredQuestionId: number,
  answers: Record<string, string[]>,
  roots: IQuestion[]
): IQuestion[] => {
  const byId = buildQuestionMap(roots);
  const answeredQ = byId.get(answeredQuestionId);
  if (!answeredQ) return queue;

  const idx = queue.findIndex((q) => q.id === answeredQuestionId);
  if (idx === -1) return queue;

  const ans = answers[String(answeredQuestionId)] ?? [];
  const newChildren = matchingChildren(answeredQ, ans);

  const head = queue.slice(0, idx + 1);
  const tail = queue.slice(idx + 1).filter((q) => !isDescendantOf(q, answeredQuestionId, byId));

  return [...head, ...newChildren, ...tail];
};
