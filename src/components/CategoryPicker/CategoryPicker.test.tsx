import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryPicker from './CategoryPicker';


jest.mock('@/components/CategoryChip/CategoryChip', () => {
  const { Pressable, Text } = require('react-native');
  return function MockCategoryChip({ category, isSelected, onPress }: any) {
    return (
      <Pressable onPress={onPress} testID={`chip-${category}`}>
        <Text>{category}</Text>
        <Text>{isSelected ? 'Selected' : 'Not Selected'}</Text>
      </Pressable>
    );
  };
});

describe('CategoryPicker', () => {
  it('renders all categories', () => {
    const { getByTestId } = render(
      <CategoryPicker selected={'Breakfast'} onSelect={jest.fn()} />
    );
    
    expect(getByTestId(`chip-Breakfast`)).toBeTruthy();
    expect(getByTestId(`chip-Soup`)).toBeTruthy();
    expect(getByTestId(`chip-Main Course`)).toBeTruthy();
    expect(getByTestId(`chip-Salad`)).toBeTruthy();
  });

  it('calls onSelect when a category is pressed', () => {
    const onSelectMock = jest.fn();
    const { getByTestId } = render(
      <CategoryPicker selected={'Breakfast'} onSelect={onSelectMock} />
    );
    
    fireEvent.press(getByTestId(`chip-Soup`));
    expect(onSelectMock).toHaveBeenCalledWith('Soup');
  });
});
