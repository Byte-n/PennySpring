export interface MigrationJournalEntry {
  idx: number
  when: number
  tag: string
  breakpoints: boolean
}

export interface MigrationBundle {
  journal: {
    entries: MigrationJournalEntry[]
  }
  migrations: Record<string, string>
}

export const migrations: MigrationBundle = {
  journal: {
    entries: [],
  },
  migrations: {},
}
