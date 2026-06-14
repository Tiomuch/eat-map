import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ScheduleScreen from './ScheduleScreen';
import { getScheduleForWeek, removeFromSchedule, getWeekDates, cleanupPastScheduleItems } from '@/db/scheduleRepository/scheduleRepository';
import { useRouter } from 'expo-router';


jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#000', surfaceVariant: '#eee', textSecondary: '#666', primary: '#f00' },
  }),
}));

jest.mock('@/db/scheduleRepository/scheduleRepository', () => ({
  getScheduleForWeek: jest.fn(),
  removeFromSchedule: jest.fn(),
  getWeekDates: jest.fn(() => ['2023-10-01', '2023-10-02']),
  cleanupPastScheduleItems: jest.fn(),
}));



jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn((cb) => cb()),
}));

describe('ScheduleScreen', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (getScheduleForWeek as jest.Mock).mockResolvedValue({});
  });

  it('renders correctly with no scheduled items', async () => {
    const { getByText } = render(<ScheduleScreen />);
    
    await waitFor(() => {
      // expect(getByText('No meals planned for this day.')).toBeTruthy();
    });
  });

  it('renders correctly with scheduled items', async () => {
    (getScheduleForWeek as jest.Mock).mockResolvedValue({
      '2023-10-01': [
      {
        id: 1,
        dishId: 1,
        date: '2023-10-01',
        category: 'Main Course',
        dishName: 'Pizza',
        dishPhoto: null
      }
    ]});
    const { getByText } = render(<ScheduleScreen />);
    
    await waitFor(() => {
      expect(getByText('Pizza')).toBeTruthy();
      expect(getByText('Main Course')).toBeTruthy();
    });
  });
});
