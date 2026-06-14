import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConfirmModal from './ConfirmModal';

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { surface: '#fff', text: '#000', textSecondary: '#666', danger: '#f00', border: '#ccc' },
  }),
}));


describe('ConfirmModal', () => {
  it('renders correctly when visible', () => {
    const { getByText } = render(
      <ConfirmModal
        visible={true}
        title="Delete Dish"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(getByText('Delete Dish')).toBeTruthy();
    expect(getByText('Are you sure?')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy(); // Default confirmText
    expect(getByText('Cancel')).toBeTruthy(); // Default cancelText
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <ConfirmModal
        visible={false}
        title="Delete Dish"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(queryByText('Delete Dish')).toBeNull();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const onConfirmMock = jest.fn();
    const { getByText } = render(
      <ConfirmModal
        visible={true}
        title="Title"
        message="Message"
        onConfirm={onConfirmMock}
        onCancel={jest.fn()}
      />
    );
    
    fireEvent.press(getByText('Delete'));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is pressed', () => {
    const onCancelMock = jest.fn();
    const { getByText } = render(
      <ConfirmModal
        visible={true}
        title="Title"
        message="Message"
        onConfirm={jest.fn()}
        onCancel={onCancelMock}
      />
    );
    
    fireEvent.press(getByText('Cancel'));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});
