import { create } from 'zustand';

export interface QuickBookDraftReasoningPart {
  type: 'reasoning';
  id: string;
  text: string;
  isDone: boolean;
}

export interface QuickBookDraftTextPart {
  type: 'text';
  id: string;
  text: string;
  isDone: boolean;
}

export type QuickBookDraftToolStatus =
  'preparing' | 'running' | 'done' | 'error';

export interface QuickBookDraftToolPart {
  type: 'tool';
  toolCallId: string;
  toolName: string;
  status: QuickBookDraftToolStatus;
  summary?: string;
  itemCount?: number;
}

export type QuickBookDraftProgressPart =
  QuickBookDraftReasoningPart | QuickBookDraftTextPart | QuickBookDraftToolPart;

export interface QuickBookDraftProgress {
  parts: readonly QuickBookDraftProgressPart[];
  updatedTime: number;
}

export type QuickBookDraftStreamEvent =
  | { type: 'reasoning-start'; id: string }
  | { type: 'reasoning-delta'; id: string; text: string }
  | { type: 'reasoning-end'; id: string }
  | { type: 'text-start'; id: string }
  | { type: 'text-delta'; id: string; text: string }
  | { type: 'text-end'; id: string }
  | { type: 'tool-input-start'; toolCallId: string; toolName: string }
  | {
      type: 'tool-input';
      toolCallId: string;
      toolName: string;
      summary: string;
      itemCount: number;
    }
  | { type: 'tool-call'; toolCallId: string; toolName: string }
  | { type: 'tool-result'; toolCallId: string }
  | { type: 'tool-error'; toolCallId: string };

const EMPTY_PARTS: readonly QuickBookDraftProgressPart[] = [];

export const EMPTY_QUICK_BOOK_DRAFT_PROGRESS: QuickBookDraftProgress = {
  parts: EMPTY_PARTS,
  updatedTime: 0,
};

function findOpenStreamPartIndex(
  parts: readonly QuickBookDraftProgressPart[],
  type: 'reasoning' | 'text',
  id: string,
): number {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    if (part === undefined) {
      continue;
    }
    if (part.type !== 'reasoning' && part.type !== 'text') {
      continue;
    }
    if (part.type !== type || part.id !== id || part.isDone) {
      continue;
    }
    return index;
  }
  return -1;
}

function findToolPartIndex(
  parts: readonly QuickBookDraftProgressPart[],
  toolCallId: string,
): number {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    if (part?.type === 'tool' && part.toolCallId === toolCallId) {
      return index;
    }
  }
  return -1;
}

function replacePart(
  parts: readonly QuickBookDraftProgressPart[],
  index: number,
  part: QuickBookDraftProgressPart,
): readonly QuickBookDraftProgressPart[] {
  return parts.map((item, itemIndex) => (itemIndex === index ? part : item));
}

function applyStreamEvent(
  parts: readonly QuickBookDraftProgressPart[],
  event: QuickBookDraftStreamEvent,
): readonly QuickBookDraftProgressPart[] {
  switch (event.type) {
    case 'reasoning-start':
    case 'text-start': {
      const type = event.type === 'reasoning-start' ? 'reasoning' : 'text';
      if (findOpenStreamPartIndex(parts, type, event.id) >= 0) {
        return parts;
      }
      return [...parts, { type, id: event.id, text: '', isDone: false }];
    }

    case 'reasoning-delta':
    case 'text-delta': {
      if (event.text === '') {
        return parts;
      }
      const type = event.type === 'reasoning-delta' ? 'reasoning' : 'text';
      const index = findOpenStreamPartIndex(parts, type, event.id);
      if (index < 0) {
        return [
          ...parts,
          { type, id: event.id, text: event.text, isDone: false },
        ];
      }
      const current = parts[index];
      if (
        current === undefined ||
        (current.type !== 'reasoning' && current.type !== 'text')
      ) {
        return parts;
      }
      return replacePart(parts, index, {
        ...current,
        text: current.text + event.text,
      });
    }

    case 'reasoning-end':
    case 'text-end': {
      const type = event.type === 'reasoning-end' ? 'reasoning' : 'text';
      const index = findOpenStreamPartIndex(parts, type, event.id);
      if (index < 0) {
        return parts;
      }
      const current = parts[index];
      if (
        current === undefined ||
        (current.type !== 'reasoning' && current.type !== 'text')
      ) {
        return parts;
      }
      return replacePart(parts, index, { ...current, isDone: true });
    }

    case 'tool-input-start': {
      const index = findToolPartIndex(parts, event.toolCallId);
      if (index < 0) {
        return [
          ...parts,
          {
            type: 'tool',
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            status: 'preparing',
          },
        ];
      }
      const current = parts[index];
      if (current === undefined || current.type !== 'tool') {
        return parts;
      }
      if (current.toolName === event.toolName) {
        return parts;
      }
      return replacePart(parts, index, {
        ...current,
        toolName: event.toolName,
      });
    }

    case 'tool-input': {
      const preview =
        event.summary === '' && event.itemCount <= 0
          ? {}
          : {
              ...(event.summary === '' ? {} : { summary: event.summary }),
              ...(event.itemCount > 0 ? { itemCount: event.itemCount } : {}),
            };
      const index = findToolPartIndex(parts, event.toolCallId);
      if (index < 0) {
        return [
          ...parts,
          {
            type: 'tool',
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            status: 'preparing',
            ...preview,
          },
        ];
      }
      const current = parts[index];
      if (current === undefined || current.type !== 'tool') {
        return parts;
      }
      if (
        current.toolName === event.toolName &&
        (event.summary === '' || current.summary === event.summary) &&
        (event.itemCount <= 0 || current.itemCount === event.itemCount)
      ) {
        return parts;
      }
      return replacePart(parts, index, {
        ...current,
        toolName: event.toolName,
        ...preview,
      });
    }

    case 'tool-call': {
      const index = findToolPartIndex(parts, event.toolCallId);
      if (index < 0) {
        return [
          ...parts,
          {
            type: 'tool',
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            status: 'running',
          },
        ];
      }
      const current = parts[index];
      if (current === undefined || current.type !== 'tool') {
        return parts;
      }
      if (current.toolName === event.toolName && current.status === 'running') {
        return parts;
      }
      return replacePart(parts, index, {
        ...current,
        toolName: event.toolName,
        status: 'running',
      });
    }

    case 'tool-result':
    case 'tool-error': {
      const nextStatus = event.type === 'tool-result' ? 'done' : 'error';
      const index = findToolPartIndex(parts, event.toolCallId);
      if (index < 0) {
        return parts;
      }
      const current = parts[index];
      if (current === undefined || current.type !== 'tool') {
        return parts;
      }
      if (current.status === nextStatus) {
        return parts;
      }
      return replacePart(parts, index, { ...current, status: nextStatus });
    }

    default:
      return parts;
  }
}

export function reduceQuickBookDraftProgress(
  progress: QuickBookDraftProgress,
  event: QuickBookDraftStreamEvent,
  now: number = Date.now(),
): QuickBookDraftProgress {
  const parts = applyStreamEvent(progress.parts, event);
  if (parts === progress.parts) {
    return progress;
  }
  return { parts, updatedTime: now };
}

interface QuickBookDraftProgressStore {
  progressById: Record<string, QuickBookDraftProgress>;
}

export const useQuickBookDraftProgressStore =
  create<QuickBookDraftProgressStore>(() => ({
    progressById: {},
  }));

export function beginQuickBookDraftProgress(draftId: string): void {
  useQuickBookDraftProgressStore.setState(state => ({
    progressById: {
      ...state.progressById,
      [draftId]: EMPTY_QUICK_BOOK_DRAFT_PROGRESS,
    },
  }));
}

export function applyQuickBookDraftStreamEvent(
  draftId: string,
  event: QuickBookDraftStreamEvent,
): void {
  useQuickBookDraftProgressStore.setState(state => {
    const current =
      state.progressById[draftId] ?? EMPTY_QUICK_BOOK_DRAFT_PROGRESS;
    const next = reduceQuickBookDraftProgress(current, event);
    if (next === current) {
      return state;
    }
    return {
      progressById: { ...state.progressById, [draftId]: next },
    };
  });
}

export function clearQuickBookDraftProgress(draftId: string): void {
  useQuickBookDraftProgressStore.setState(state => {
    if (state.progressById[draftId] === undefined) {
      return state;
    }
    const progressById = { ...state.progressById };
    delete progressById[draftId];
    return { progressById };
  });
}

export function useQuickBookDraftProgress(
  draftId: string,
): QuickBookDraftProgress {
  return useQuickBookDraftProgressStore(
    state => state.progressById[draftId] ?? EMPTY_QUICK_BOOK_DRAFT_PROGRESS,
  );
}
