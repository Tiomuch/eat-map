import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategorySlider from './CategorySlider';
import { Dish } from '@/types/dish';

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { text: '#000', textSecondary: '#666', textTertiary: '#999' },
  }),
}));


jest.mock('react-native-reanimated-carousel', () => {
  const { View, Text, Pressable } = require('react-native');
  return function MockCarousel({ data, renderItem }: any) {
    return (
      <View testID="carousel-mock">
        {data.map((item: any, index: number) => (
          <View key={index}>
            {renderItem({ item, index })}
          </View>
        ))}
      </View>
    );
  };
});

jest.mock('@/components/DishCard/DishCard', () => {
  const { Pressable, Text } = require('react-native');
  return function MockDishCard({ dish, onPress }: any) {
    return (
      <Pressable onPress={onPress} testID={`dish-card-${dish.id}`}>
        <Text>{dish.name}</Text>
      </Pressable>
    );
  };
});

describe('CategorySlider', () => {
  const mockDishes: Dish[] = [
    { id: 1, name: 'Pancakes', category: 'Breakfast', description: '', photoUri: null, createdAt: '2023-01-01' },
    { id: 2, name: 'Waffles', category: 'Breakfast', description: '', photoUri: null, createdAt: '2023-01-01' },
  ];

  it('renders empty state when no dishes provided', () => {
    const { getByText } = render(
      <CategorySlider category={'Breakfast'} dishes={[]} onDishPress={jest.fn()} />
    );
    
    expect(getByText('No dishes yet')).toBeTruthy();
  });

  it('renders carousel when dishes are provided', () => {
    const { getByTestId, getByText } = render(
      <CategorySlider category={'Breakfast'} dishes={mockDishes} onDishPress={jest.fn()} />
    );
    
    expect(getByTestId('carousel-mock')).toBeTruthy();
    expect(getByText('Pancakes')).toBeTruthy();
    expect(getByText('Waffles')).toBeTruthy();
  });

  it('calls onDishPress when a dish is pressed', () => {
    const onDishPressMock = jest.fn();
    const { getByTestId } = render(
      <CategorySlider category={'Breakfast'} dishes={mockDishes} onDishPress={onDishPressMock} />
    );
    
    fireEvent.press(getByTestId('dish-card-1'));
    expect(onDishPressMock).toHaveBeenCalledWith(mockDishes[0]);
  });
});
