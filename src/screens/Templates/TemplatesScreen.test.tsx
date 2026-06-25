import { render } from '@testing-library/react-native'
import React from 'react'
import TemplatesScreen from './TemplatesScreen'
import { ThemeProvider } from '@/theme/ThemeContext'

jest.mock('@/db/templateRepository/templateRepository', () => ({
  getTemplates: jest.fn().mockResolvedValue([]),
  deleteTemplate: jest.fn(),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useFocusEffect: jest.fn((cb) => cb()),
}))

describe('TemplatesScreen', () => {
  it('renders correctly with empty list', () => {
    const { getByText, getByPlaceholderText } = render(
      <ThemeProvider>
        <TemplatesScreen />
      </ThemeProvider>
    )

    expect(getByText('Templates')).toBeTruthy()
    expect(getByPlaceholderText('Search templates...')).toBeTruthy()
    expect(getByText("You don't have any templates yet.")).toBeTruthy()
  })
})
