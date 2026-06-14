import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import { getAllDishes, getDishesByCategory } from '@/db/dishRepository/dishRepository';
import { useRouter } from 'expo-router';


jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#000', surfaceVariant: '#eee', textSecondary: '#666', primary: '#f00' },
  }),
}));

jest.mock('@/db/dishRepository/dishRepository', () => ({
  getAllDishes: jest.fn(),
  getDishesByCategory: jest.fn(),
}));



jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn((cb) => cb()),
}));

describe('HomeScreen', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (getAllDishes as jest.Mock).mockResolvedValue([]);
    (getDishesByCategory as jest.Mock).mockResolvedValue([]);
  });

  it('renders correctly with no dishes', async () => {
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      expect(getByText('Random')).toBeTruthy();
    });
  });

  it('renders correctly with dishes', async () => {
    (getAllDishes as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Burger', category: 'Lunch', photoUri: '' }
    ]);
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      expect(getByText('Random')).toBeTruthy();
    });
  });
});
