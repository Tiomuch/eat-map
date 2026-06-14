import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DayChipsPicker from './DayChipsPicker';

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { primary: '#00f', surfaceVariant: '#eee', border: '#ccc', textSecondary: '#666', text: '#000' },
  }),
}));


describe('DayChipsPicker', () => {
  const mockDayChips = [
    { date: '2023-10-01', dayShort: 'Sun', dayNum: 1, isToday: true },
    { date: '2023-10-02', dayShort: 'Mon', dayNum: 2, isToday: false },
  ];

  it('renders all day chips', () => {
    const { getByText } = render(
      <DayChipsPicker dayChips={mockDayChips} selectedDate="2023-10-01" onSelectDate={jest.fn()} />
    );
    
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('calls onSelectDate when a chip is pressed', () => {
    const onSelectDateMock = jest.fn();
    const { getByText } = render(
      <DayChipsPicker dayChips={mockDayChips} selectedDate="2023-10-01" onSelectDate={onSelectDateMock} />
    );
    
    fireEvent.press(getByText('Mon'));
    expect(onSelectDateMock).toHaveBeenCalledWith('2023-10-02');
  });
});
