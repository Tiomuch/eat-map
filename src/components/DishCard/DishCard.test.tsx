import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DishCard from './DishCard';
import { Dish } from '@/types/dish';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="expo-image" {...props} />,
  };
});

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff',
      surface: '#fff',
      text: '#000',
      textSecondary: '#666',
      border: '#eee',
      categoryChip: '#ddd',
      categoryChipText: '#333',
    },
  }),
}));

describe('DishCard', () => {
  const mockDish: Dish = {
    id: 1,
    name: 'Pancakes',
    category: 'Breakfast',
    description: '',
    photoUri: null,
    createdAt: '2023-01-01',
  };

  it('renders dish name correctly', () => {
    const { getByText } = render(<DishCard dish={mockDish} onPress={jest.fn()} />);
    
    expect(getByText('Pancakes')).toBeTruthy();
  });

  it('renders placeholder when no photoUri', () => {
    const { getByText } = render(<DishCard dish={mockDish} onPress={jest.fn()} />);
    
    expect(getByText('🍽️')).toBeTruthy();
  });

  it('renders image when photoUri is provided', () => {
    const { getByTestId } = render(
      <DishCard dish={{ ...mockDish, photoUri: 'file://image.jpg' }} onPress={jest.fn()} />
    );
    
    expect(getByTestId('expo-image')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<DishCard dish={mockDish} onPress={onPressMock} />);
    
    fireEvent.press(getByText('Pancakes'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
