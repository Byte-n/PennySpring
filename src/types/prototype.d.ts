declare global {
  interface Number {
    formatDate(relative?: boolean): string;
    formatDateTime(): string;
    formatDateBy(format: string): string;
  }

  interface String {
    formatDate(relative?: boolean): string;
    formatDateTime(): string;
    formatDateBy(format: string): string;
  }

  interface Date {
    formatDate(relative?: boolean): string;
    formatDateTime(): string;
    formatDateBy(format: string): string;
  }
}

declare module 'dayjs' {
  interface Dayjs {
    formatDate(relative?: boolean): string;
    formatDateTime(): string;
    formatDateBy(format: string): string;
  }
}

export {};
