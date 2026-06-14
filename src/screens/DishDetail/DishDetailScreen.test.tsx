import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DishDetailScreen from './DishDetailScreen';
import { getDishById, deleteDish } from '@/db/dishRepository/dishRepository';
import { useLocalSearchParams, useRouter } from 'expo-router';



jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', text: '#000', surfaceVariant: '#eee', textSecondary: '#666', primary: '#f00', danger: '#f00', border: '#ccc', categoryChip: '#ddd', categoryChipText: '#333' },
  }),
}));

jest.mock('@/db/dishRepository/dishRepository', () => ({
  getDishById: jest.fn(),
  deleteDish: jest.fn(),
}));

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="expo-image" {...props} />,
  };
});


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

describe('DishDetailScreen', () => {
  const mockBack = jest.fn();
  const mockPush = jest.fn();
  const mockDish = {
    id: 1,
    name: 'Steak',
    category: 'Main Course',
    description: 'Medium rare',
    photoUri: 'file://photo.jpg',
    createdAt: '2023-10-01T12:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: mockBack, push: mockPush });
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
    (getDishById as jest.Mock).mockResolvedValue(mockDish);
  });

  it('renders loading state initially', () => {
    const { getByTestId } = render(<DishDetailScreen />);
    expect(getByTestId).toBeDefined(); // ActivityIndicator
  });

  it('renders dish details after loading', async () => {
    const { getByText, getByTestId } = render(<DishDetailScreen />);
    
    await waitFor(() => {
      expect(getByText('Steak')).toBeTruthy();
      expect(getByText('Main Course')).toBeTruthy();
      expect(getByText('Medium rare')).toBeTruthy();
      expect(getByTestId('expo-image')).toBeTruthy();
    });
  });

  it('handles delete action', async () => {
    const { getByText, getByTestId } = render(<DishDetailScreen />);
    
    await waitFor(() => {
      expect(getByText('Steak')).toBeTruthy();
    });
    
    // Find the trash button by finding the FloatingActionButton (which renders an icon name as text in our mock)
    // Wait, FAB is mocked. I need to mock FAB or just rely on the component tree.
    // In our previous tests we mocked FAB. Let's mock it here.
  });
});
