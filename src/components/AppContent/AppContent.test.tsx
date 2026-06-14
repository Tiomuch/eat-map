import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AppContent from './AppContent';
import { initDatabase } from '@/db/database/database';

jest.mock('@/db/database/database', () => ({
  initDatabase: jest.fn(),
}));

jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: { background: '#fff', textSecondary: '#666', primary: '#000', danger: '#f00' },
    isDark: false,
  }),
}));

describe('AppContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator initially', async () => {
    (initDatabase as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    const { getByText, getByTestId } = render(<AppContent />);
    
    expect(getByText('Preparing your dishes...')).toBeTruthy();
  });

  it('renders Stack after database initializes', async () => {
    (initDatabase as jest.Mock).mockResolvedValue(undefined);
    const { queryByText } = render(<AppContent />);
    
    await waitFor(() => {
      expect(queryByText('Preparing your dishes...')).toBeNull();
    });
  });

  it('shows error if database fails to initialize', async () => {
    (initDatabase as jest.Mock).mockRejectedValue(new Error('DB Error'));
    const { getByText } = render(<AppContent />);
    
    await waitFor(() => {
      expect(getByText('Error: DB Error')).toBeTruthy();
    });
  });
});
