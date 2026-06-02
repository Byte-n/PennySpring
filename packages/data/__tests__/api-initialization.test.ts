describe('data api initialization', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  test('waits for the same migration when database initialization is concurrent', async () => {
    const connection = { name: 'pennyspring.db' }
    const database = { id: 'database' }
    const open = jest.fn(() => connection)
    const createDatabase = jest.fn(() => database)
    let finishMigration: () => void = () => undefined
    const runMigrations = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishMigration = resolve
        }),
    )

    jest.doMock('@op-engineering/op-sqlite', () => ({ open }))
    jest.doMock('../src/runtime', () => ({
      createDatabase,
      runMigrations,
      schema: {},
    }))

    const { api } = await import('../src/index')

    const firstDatabase = api.get()
    const secondDatabase = api.get()
    let secondResolved = false
    secondDatabase.then(() => {
      secondResolved = true
    })

    await Promise.resolve()
    await Promise.resolve()

    expect(open).toHaveBeenCalledTimes(1)
    expect(createDatabase).toHaveBeenCalledTimes(1)
    expect(runMigrations).toHaveBeenCalledTimes(1)
    expect(secondResolved).toBe(false)

    finishMigration()

    await expect(Promise.all([firstDatabase, secondDatabase])).resolves.toEqual([
      database,
      database,
    ])
  })
})
