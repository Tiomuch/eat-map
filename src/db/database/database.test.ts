import { initDatabase, getDatabase } from './database'
import * as SQLite from 'expo-sqlite'

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}))

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///data/user/0/com.app/files/',
  getInfoAsync: jest.fn(),
  copyAsync: jest.fn(),
}))

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(),
      localUri: 'file:///local.png',
    })),
  },
}))

describe('database', () => {
  let mockExecAsync: jest.Mock
  let mockGetFirstAsync: jest.Mock
  let mockRunAsync: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockExecAsync = jest.fn()
    mockGetFirstAsync = jest.fn().mockResolvedValue({ count: 1 })
    mockRunAsync = jest.fn()
    ;(SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue({
      execAsync: mockExecAsync,
      getFirstAsync: mockGetFirstAsync,
      runAsync: mockRunAsync,
    })
  })

  it('initializes the database successfully', async () => {
    await initDatabase()

    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('eatmap.db')
    expect(mockExecAsync).toHaveBeenCalled()
  })

  it('returns the database instance', async () => {
    const db = await getDatabase()
    expect(db).toBeDefined()
    expect(db.execAsync).toBeDefined()
  })
})
