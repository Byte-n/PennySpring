const EMPTY_ERROR = undefined;

export function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') {
    return error === '' ? EMPTY_ERROR : error;
  }

  if (error instanceof Error) {
    return error.message === '' ? EMPTY_ERROR : error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message === '' ? EMPTY_ERROR : error.message;
  }

  return EMPTY_ERROR;
}

export function getFieldErrorMessage(errors: readonly unknown[]): string | undefined {
  for (const error of errors) {
    const message = getErrorMessage(error);

    if (message !== undefined) {
      return message;
    }
  }

  return EMPTY_ERROR;
}

export function getFieldErrorMessages(errors: readonly unknown[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    const message = getErrorMessage(error);

    if (message !== undefined && !messages.includes(message)) {
      messages.push(message);
    }
  }

  return messages;
}
