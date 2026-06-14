import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryChip from './CategoryChip';


jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { primary: '#00f', categoryChip: '#eee', border: '#ccc', categoryChipText: '#333' },
  }),
}));


describe('CategoryChip', () => {
  it('renders category text correctly', () => {
    const { getByText } = render(
      <CategoryChip category={'Breakfast'} isSelected={false} onPress={jest.fn()} />
    );
    expect(getByText('Breakfast')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <CategoryChip category={'Soup'} isSelected={false} onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Soup'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
