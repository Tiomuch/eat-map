import * as SQLite from 'expo-sqlite'
import {
  createTemplate,
  getTemplates,
  getTemplateItems,
  deleteTemplate,
  updateTemplateItems,
} from './templateRepository'
import { initDatabase, getDatabase } from '../database/database'

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}))

describe('templateRepository', () => {
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      execAsync: jest.fn(),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn().mockResolvedValue([]),
      withTransactionAsync: jest.fn((cb) => cb()),
    }
    ;(SQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates template and its items', async () => {
    await initDatabase()
    await createTemplate({
      name: 'Test Template',
      items: [{ dishId: 1, category: 'Breakfast' }],
    })
    
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO templates (name) VALUES (?)',
      ['Test Template']
    )
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO template_items (template_id, dish_id, category) VALUES (?, ?, ?)',
      [1, 1, 'Breakfast']
    )
  })

  it('gets templates', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([
      { id: 1, name: 'Template 1', created_at: '2026-06-25' },
    ])
    
    const result = await getTemplates()
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Template 1')
  })
})
