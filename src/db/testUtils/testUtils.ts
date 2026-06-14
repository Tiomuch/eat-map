import { SQLiteDatabase } from 'expo-sqlite'

export interface MockDatabase {
  runAsync: jest.Mock
  getAllAsync: jest.Mock
  getFirstAsync: jest.Mock
  execAsync: jest.Mock
}

export function createMockDatabase(): MockDatabase {
  return {
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    execAsync: jest.fn(),
  }
}
