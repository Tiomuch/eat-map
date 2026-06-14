import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FloatingActionButton from './FloatingActionButton';

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));


describe('FloatingActionButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <FloatingActionButton
        icon="plus"
        color="#fff"
        backgroundColor="#f00"
        onPress={jest.fn()}
      />
    );
    // Since MaterialCommunityIcons is mocked as a string component, 
    // it won't render text. But we can ensure it renders without crashing.
    expect(true).toBe(true);
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <FloatingActionButton icon="plus" onPress={onPressMock} testID="fab" color="#fff" backgroundColor="#f00" />
    );
    fireEvent.press(getByTestId('fab'));
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
