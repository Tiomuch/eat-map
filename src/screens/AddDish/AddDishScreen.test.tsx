import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddDishScreen from './AddDishScreen';
import { Alert } from 'react-native';
import { createDish } from '@/db/dishRepository/dishRepository';
import { useRouter } from 'expo-router';


jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#000', surfaceVariant: '#eee', textSecondary: '#666', border: '#ccc', success: '#0f0' },
  }),
}));

jest.mock('@/db/dishRepository/dishRepository', () => ({
  createDish: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///data/user/0/com.app/files/',
  copyAsync: jest.fn(),
}));


// Mock child components to isolate screen logic
jest.mock('@/components/ImagePickerField/ImagePickerField', () => {
  const { View } = require('react-native');
  return function MockImagePickerField({ onImageSelected }: any) {
    return <View testID="image-picker-field" onTouchEnd={() => onImageSelected('file://test.jpg')} />;
  };
});

jest.mock('@/components/CategoryPicker/CategoryPicker', () => {
  const { View } = require('react-native');
  return function MockCategoryPicker({ onSelect }: any) {
    return <View testID="category-picker" onTouchEnd={() => onSelect('Lunch')} />;
  };
});

jest.mock('@/components/FloatingActionButton/FloatingActionButton', () => {
  const { Pressable, Text } = require('react-native');
  return function MockFAB({ onPress, icon }: any) {
    return (
      <Pressable onPress={onPress} testID={`fab-${icon}`}>
        <Text>{icon}</Text>
      </Pressable>
    );
  };
});

describe('AddDishScreen', () => {
  const mockBack = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
    jest.spyOn(Alert, 'alert');
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<AddDishScreen />);
    
    expect(getByText('New Dish')).toBeTruthy();
    expect(getByPlaceholderText("What's the dish called?")).toBeTruthy();
    expect(getByPlaceholderText('Describe the dish, ingredients, taste...')).toBeTruthy();
  });

  it('shows alert if name is empty and save is pressed', () => {
    const { getByTestId } = render(<AddDishScreen />);
    
    fireEvent.press(getByTestId('fab-check'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Name required', 'Please enter a dish name.');
    expect(createDish).not.toHaveBeenCalled();
  });

  it('saves dish successfully and goes back', async () => {
    const { getByTestId, getByPlaceholderText } = render(<AddDishScreen />);
    
    const nameInput = getByPlaceholderText("What's the dish called?");
    fireEvent.changeText(nameInput, 'Pizza');
    
    // Simulate image selection
    fireEvent(getByTestId('image-picker-field'), 'touchEnd');
    
    // Simulate category selection
    fireEvent(getByTestId('category-picker'), 'touchEnd');
    
    fireEvent.press(getByTestId('fab-check'));
    
    await waitFor(() => {
      expect(createDish).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Pizza',
        category: 'Lunch', // Mapped from our mock
        // We mocked the file copy, so finalPhotoUri is 'file:///data/user/0/com.app/files/dish_...jpg'
      }));
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it('goes back when back button is pressed', () => {
    const { getByTestId } = render(<AddDishScreen />);
    
    fireEvent.press(getByTestId('fab-arrow-left'));
    expect(mockBack).toHaveBeenCalled();
  });
});
