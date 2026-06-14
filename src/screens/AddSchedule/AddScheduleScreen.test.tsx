import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddToScheduleScreen from './AddScheduleScreen';
import { addToSchedule, isDishScheduledForDate, getWeekDates } from '@/db/scheduleRepository/scheduleRepository';
import { useLocalSearchParams, useRouter } from 'expo-router';


jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#000', surfaceVariant: '#eee', textSecondary: '#666', primary: '#f00', warning: '#ff0', textTertiary: '#999' },
  }),
}));

jest.mock('@/db/scheduleRepository/scheduleRepository', () => ({
  addToSchedule: jest.fn(),
  isDishScheduledForDate: jest.fn(),
  getWeekDates: jest.fn(),
}));


jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('@/components/ConfirmModal/ConfirmModal', () => {
  const { View, Text, Pressable } = require('react-native');
  return function MockConfirmModal({ visible, title, onConfirm, onCancel }: any) {
    if (!visible) return null;
    return (
      <View testID={`modal-${title}`}>
        <Text>{title}</Text>
        <Pressable testID={`confirm-${title}`} onPress={onConfirm} />
        <Pressable testID={`cancel-${title}`} onPress={onCancel} />
      </View>
    );
  };
});

describe('AddToScheduleScreen', () => {
  const mockBack = jest.fn();
  const mockReplace = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack, replace: mockReplace, canGoBack: () => true });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      dishId: '1',
      dishName: 'Burger',
      dishPhoto: '',
      dishCategory: 'Lunch',
    });
    (getWeekDates as jest.Mock).mockReturnValue(['2023-10-01', '2023-10-02']);
  });

  it('renders correctly', () => {
    const { getAllByText, getByText } = render(<AddToScheduleScreen />);
    
    expect(getAllByText('Add to Schedule')).toBeTruthy();
    expect(getByText('Burger')).toBeTruthy();
  });

  it('shows duplicate modal if already scheduled', async () => {
    (isDishScheduledForDate as jest.Mock).mockResolvedValue(true);
    const { getAllByText, getByText, getByTestId } = render(<AddToScheduleScreen />);
    
    fireEvent.press(getAllByText('Add to Schedule', { exact: false })[1]);
    
    // Confirm the add modal
    fireEvent.press(getByTestId('confirm-Add to Schedule'));

    await waitFor(() => {
      expect(getByTestId('modal-Already Scheduled')).toBeTruthy();
    });
  });

  it('adds to schedule successfully', async () => {
    (isDishScheduledForDate as jest.Mock).mockResolvedValue(false);
    const { getAllByText, getByText, getByTestId } = render(<AddToScheduleScreen />);
    
    fireEvent.press(getAllByText('Add to Schedule', { exact: false })[1]);
    
    // Confirm the add modal
    fireEvent.press(getByTestId('confirm-Add to Schedule'));

    await waitFor(() => {
      expect(addToSchedule).toHaveBeenCalledWith(1, '2023-10-01', 'Lunch');
      expect(mockBack).toHaveBeenCalled();
    });
  });
});
