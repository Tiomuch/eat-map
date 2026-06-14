import { getDatabase } from '../database/database'
import { ScheduleItem, Category } from '@/types/dish'

interface ScheduleRow {
  id: number
  dish_id: number
  date: string
  category: string
  dish_name: string
  dish_photo_uri: string | null
}

function mapRowToScheduleItem(row: ScheduleRow): ScheduleItem {
  return {
    id: row.id,
    dishId: row.dish_id,
    date: row.date,
    category: row.category as Category,
    dishName: row.dish_name,
    dishPhotoUri: row.dish_photo_uri,
  }
}

/**
 * Get today's date as 'YYYY-MM-DD' in local timezone.
 */
export function getTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get an array of date strings for today + next 6 days.
 */
export function getWeekDates(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    dates.push(`${year}-${month}-${day}`)
  }
  return dates
}

/**
 * Delete all schedule items with dates before today.
 */
export async function cleanupPastScheduleItems(): Promise<void> {
  const db = await getDatabase()
  const today = getTodayDate()
  await db.runAsync('DELETE FROM schedule_items WHERE date < ?', [today])
}

/**
 * Get all scheduled items for a specific date, joined with dish info.
 */
export async function getScheduleForDate(date: string): Promise<ScheduleItem[]> {
  const db = await getDatabase()
  const rows = await db.getAllAsync<ScheduleRow>(
    `SELECT s.id, s.dish_id, s.date, s.category,
            d.name as dish_name, d.photo_uri as dish_photo_uri
     FROM schedule_items s
     JOIN dishes d ON s.dish_id = d.id
     WHERE s.date = ?
     ORDER BY s.category, d.name`,
    [date],
  )
  return rows.map(mapRowToScheduleItem)
}

/**
 * Get all scheduled items for a date range, grouped by date.
 */
export async function getScheduleForWeek(dates: string[]): Promise<Record<string, ScheduleItem[]>> {
  const result: Record<string, ScheduleItem[]> = {}
  for (const date of dates) {
    result[date] = await getScheduleForDate(date)
  }
  return result
}

/**
 * Check if a dish is already scheduled for a specific date.
 */
export async function isDishScheduledForDate(dishId: number, date: string): Promise<boolean> {
  const db = await getDatabase()
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM schedule_items WHERE dish_id = ? AND date = ?',
    [dishId, date],
  )
  return (row?.count ?? 0) > 0
}

/**
 * Add a dish to the schedule.
 */
export async function addToSchedule(
  dishId: number,
  date: string,
  category: string,
): Promise<number> {
  const db = await getDatabase()
  const result = await db.runAsync(
    'INSERT INTO schedule_items (dish_id, date, category) VALUES (?, ?, ?)',
    [dishId, date, category],
  )
  return result.lastInsertRowId
}

/**
 * Remove a schedule item by id.
 */
export async function removeFromSchedule(id: number): Promise<void> {
  const db = await getDatabase()
  await db.runAsync('DELETE FROM schedule_items WHERE id = ?', [id])
}
