import React from 'react';
import { render } from '@testing-library/react-native';
import DishPreviewCard from './DishPreviewCard';

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { surface: '#fff', surfaceVariant: '#eee', text: '#000', categoryChip: '#ddd', categoryChipText: '#333' },
  }),
}));

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="expo-image" {...props} />,
  };
});

describe('DishPreviewCard', () => {
  it('renders dish name and category correctly', () => {
    const { getByText } = render(
      <DishPreviewCard dishName="Burger" dishCategory="Lunch" dishPhoto="" />
    );
    
    expect(getByText('Burger')).toBeTruthy();
    expect(getByText('Lunch')).toBeTruthy();
  });

  it('renders placeholder when no photo is provided', () => {
    const { getByText } = render(
      <DishPreviewCard dishName="Burger" dishCategory="Lunch" dishPhoto="" />
    );
    
    expect(getByText('🍽️')).toBeTruthy();
  });

  it('renders image when photo is provided', () => {
    const { getByTestId } = render(
      <DishPreviewCard dishName="Burger" dishCategory="Lunch" dishPhoto="http://example.com/photo.jpg" />
    );
    
    expect(getByTestId('expo-image')).toBeTruthy();
  });
});
