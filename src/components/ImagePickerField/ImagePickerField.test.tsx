import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ImagePickerField from './ImagePickerField';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { surfaceVariant: '#eee', border: '#ccc', primary: '#00f', text: '#000', textTertiary: '#999' },
  }),
}));

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="expo-image" {...props} />,
  };
});


jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

describe('ImagePickerField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android'; // test Android alert branch
    jest.spyOn(Alert, 'alert');
  });

  it('renders placeholder when no imageUri is provided', () => {
    const { getByText } = render(<ImagePickerField imageUri={null} onImageSelected={jest.fn()} />);
    expect(getByText('Add Photo')).toBeTruthy();
  });

  it('renders image when imageUri is provided', () => {
    const { getByTestId, getByText } = render(
      <ImagePickerField imageUri="http://example.com/photo.jpg" onImageSelected={jest.fn()} />
    );
    expect(getByTestId('expo-image')).toBeTruthy();
    expect(getByText('Change Photo')).toBeTruthy();
  });

  it('shows picker options when pressed', () => {
    const { getByText, getByRole } = render(<ImagePickerField imageUri={null} onImageSelected={jest.fn()} />);
    
    fireEvent.press(getByText('Add Photo'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Add Photo',
      'Choose an option',
      expect.any(Array)
    );
  });

  it('handles camera permission denied', async () => {
    (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    const { getByText } = render(<ImagePickerField imageUri={null} onImageSelected={jest.fn()} />);
    
    fireEvent.press(getByText('Add Photo'));
    
    // Simulate pressing "Take Photo"
    const alertCalls = (Alert.alert as any).mock.calls;
    const takePhotoPress = alertCalls[0][2][1].onPress;
    
    takePhotoPress();
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Permission needed', 'Camera permission is required to take photos.');
    });
  });

  it('handles library selection success', async () => {
    const onImageSelectedMock = jest.fn();
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://new-photo.jpg' }],
    });

    const { getByText } = render(<ImagePickerField imageUri={null} onImageSelected={onImageSelectedMock} />);
    
    fireEvent.press(getByText('Add Photo'));
    
    // Simulate pressing "Choose from Gallery"
    const alertCalls = (Alert.alert as any).mock.calls;
    const chooseGalleryPress = alertCalls[0][2][2].onPress;
    
    chooseGalleryPress();
    
    await waitFor(() => {
      expect(onImageSelectedMock).toHaveBeenCalledWith('file://new-photo.jpg');
    });
  });
});
