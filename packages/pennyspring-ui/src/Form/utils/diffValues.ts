interface DiffResult {
  changed: boolean;
  value: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((item, index) => isEqual(item, right[index]));
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every(
      key => key in right && isEqual(left[key], right[key]),
    );
  }

  return false;
}

export function diffValues(previous: unknown, next: unknown): DiffResult {
  if (Object.is(previous, next) || isEqual(previous, next)) {
    return { changed: false, value: undefined };
  }

  if (isPlainObject(previous) && isPlainObject(next)) {
    const changedEntries: Record<string, unknown> = {};

    for (const key of new Set([
      ...Object.keys(previous),
      ...Object.keys(next),
    ])) {
      const result = diffValues(previous[key], next[key]);

      if (result.changed) {
        changedEntries[key] = result.value;
      }
    }

    return {
      changed: Object.keys(changedEntries).length > 0,
      value: changedEntries,
    };
  }

  return { changed: true, value: next };
}
