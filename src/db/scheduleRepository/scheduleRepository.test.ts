import {
  addToSchedule,
  removeFromSchedule,
  getScheduleForDate,
  isDishScheduledForDate,
  getWeekDates,
} from './scheduleRepository'
import { getDatabase } from '../database/database'
import { createMockDatabase, MockDatabase } from '../testUtils/testUtils'

jest.mock('../database/database', () => ({
  getDatabase: jest.fn(),
}))

describe('scheduleRepository', () => {
  let mockDb: MockDatabase

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb = createMockDatabase()
    ;(getDatabase as jest.Mock).mockResolvedValue(mockDb)
  })

  it('adds to schedule', async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 })

    const result = await addToSchedule(1, '2023-10-01', 'Breakfast')

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO schedule_items (dish_id, date, category) VALUES (?, ?, ?)',
      [1, '2023-10-01', 'Breakfast'],
    )
    expect(result).toBe(1)
  })

  it('removes from schedule', async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 })

    await removeFromSchedule(1)

    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM schedule_items WHERE id = ?', [1])
  })

  it('gets schedule for date', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      {
        id: 1,
        dish_id: 1,
        date: '2023-10-01',
        category: 'Breakfast',
        dish_name: 'Pizza',
        dish_photo_uri: null,
      },
    ])

    const schedule = await getScheduleForDate('2023-10-01')

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT s.id, s.dish_id, s.date, s.category'),
      ['2023-10-01'],
    )
    expect(schedule.length).toBe(1)
    expect(schedule[0].dishName).toBe('Pizza')
  })

  it('checks if dish is scheduled for date', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 1 })

    const result = await isDishScheduledForDate(1, '2023-10-01')

    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
      'SELECT COUNT(*) as count FROM schedule_items WHERE dish_id = ? AND date = ?',
      [1, '2023-10-01'],
    )
    expect(result).toBe(true)
  })

  it('gets week dates correctly', () => {
    const dates = getWeekDates()
    expect(dates.length).toBe(7)
    // Ensure they are formatted as YYYY-MM-DD
    expect(dates[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
