import { isAutoBackupDue } from '../../src/features/backup/schedule'

function schedule(
  frequency: 'off' | 'everyLaunch' | 'daily' | 'weekly' | 'monthly' | 'customDays',
  lastRunAt: number,
  customDays = 7,
) {
  return { frequency, lastRunAt, customDays }
}

describe('auto backup schedule', () => {
  it('does not run when auto backup is off', () => {
    expect(
      isAutoBackupDue(
        schedule('off', 0),
        new Date(2026, 9, 31, 10, 0),
        false,
      ),
    ).toBe(false)
  })

  it('runs once per app foreground session when set to every launch', () => {
    const now = new Date(2026, 9, 31, 10, 0)
    expect(isAutoBackupDue(schedule('everyLaunch', 0), now, false)).toBe(true)
    expect(isAutoBackupDue(schedule('everyLaunch', now.getTime()), now, true)).toBe(
      false,
    )
  })

  it('runs once per local calendar day', () => {
    const morning = new Date(2026, 9, 31, 8, 0)
    const evening = new Date(2026, 9, 31, 23, 0)
    expect(isAutoBackupDue(schedule('daily', 0), morning, false)).toBe(true)
    expect(isAutoBackupDue(schedule('daily', morning.getTime()), evening, false)).toBe(
      false,
    )
    expect(
      isAutoBackupDue(
        schedule('daily', morning.getTime()),
        new Date(2026, 10, 1, 0, 5),
        false,
      ),
    ).toBe(true)
  })

  it('runs once per local ISO week', () => {
    const sunday = new Date(2026, 10, 1, 12, 0)
    const sameWeek = new Date(2026, 9, 27, 9, 0)
    expect(isAutoBackupDue(schedule('weekly', sameWeek.getTime()), sunday, false)).toBe(
      false,
    )
    expect(
      isAutoBackupDue(
        schedule('weekly', sunday.getTime()),
        new Date(2026, 10, 2, 0, 5),
        false,
      ),
    ).toBe(true)
  })

  it('runs once per local calendar month', () => {
    const lastMonth = new Date(2026, 9, 1, 9, 0)
    expect(
      isAutoBackupDue(
        schedule('monthly', lastMonth.getTime()),
        new Date(2026, 9, 31, 23, 0),
        false,
      ),
    ).toBe(false)
    expect(
      isAutoBackupDue(
        schedule('monthly', lastMonth.getTime()),
        new Date(2026, 10, 1, 0, 5),
        false,
      ),
    ).toBe(true)
  })

  it('runs after the configured number of local days', () => {
    const lastRun = new Date(2026, 9, 24, 21, 0)
    expect(
      isAutoBackupDue(
        schedule('customDays', lastRun.getTime(), 7),
        new Date(2026, 9, 31, 8, 0),
        false,
      ),
    ).toBe(true)
    expect(
      isAutoBackupDue(
        schedule('customDays', lastRun.getTime(), 7),
        new Date(2026, 9, 30, 23, 0),
        false,
      ),
    ).toBe(false)
  })
})
