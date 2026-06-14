import { createDish, getAllDishes, getDishById, updateDish, deleteDish } from './dishRepository'
import { getDatabase } from '../database/database'
import { createMockDatabase, MockDatabase } from '../testUtils/testUtils'
import { CreateDishInput } from '@/types/dish'

jest.mock('../database/database', () => ({
  getDatabase: jest.fn(),
}))

describe('dishRepository', () => {
  let mockDb: MockDatabase

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb = createMockDatabase()
    ;(getDatabase as jest.Mock).mockResolvedValue(mockDb)
  })

  it('creates a dish', async () => {
    const dishData: CreateDishInput = {
      name: 'Pizza',
      description: 'Cheese',
      category: 'Main Course',
      photoUri: 'photo.jpg',
    }

    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 })

    const result = await createDish(dishData)

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO dishes (name, description, category, photo_uri) VALUES (?, ?, ?, ?)',
      [dishData.name, dishData.description, dishData.category, dishData.photoUri],
    )
    expect(result).toBe(1)
  })

  it('gets all dishes', async () => {
    mockDb.getAllAsync.mockResolvedValue([
      {
        id: 1,
        name: 'Pizza',
        description: 'Cheese',
        category: 'Main Course',
        photo_uri: 'photo.jpg',
        created_at: '2026-06-14T14:20:38',
      },
    ])

    const dishes = await getAllDishes()

    expect(mockDb.getAllAsync).toHaveBeenCalledWith('SELECT * FROM dishes ORDER BY created_at DESC')
    expect(dishes.length).toBe(1)
    expect(dishes[0].name).toBe('Pizza')
    expect(dishes[0].category).toBe('Main Course')
    expect(dishes[0].photoUri).toBe('photo.jpg')
  })

  it('gets dish by id', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1,
      name: 'Pizza',
      description: 'Cheese',
      category: 'Main Course',
      photo_uri: 'photo.jpg',
      created_at: '2026-06-14T14:20:38',
    })

    const dish = await getDishById(1)

    expect(mockDb.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM dishes WHERE id = ?', [1])
    expect(dish?.name).toBe('Pizza')
    expect(dish?.category).toBe('Main Course')
  })

  it('updates a dish', async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 })

    await updateDish(1, { name: 'Burger' })

    expect(mockDb.runAsync).toHaveBeenCalledWith('UPDATE dishes SET name = ? WHERE id = ?', [
      'Burger',
      '1',
    ])
  })

  it('deletes a dish', async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 0, changes: 1 })

    await deleteDish(1)

    expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM dishes WHERE id = ?', [1])
  })
})
