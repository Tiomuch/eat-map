import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import SaveTemplateModal from './SaveTemplateModal'
import { ThemeProvider } from '@/theme/ThemeContext'

describe('SaveTemplateModal', () => {
  const onSave = jest.fn()
  const onClose = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <ThemeProvider>
        <SaveTemplateModal visible={true} onSave={onSave} onClose={onClose} />
      </ThemeProvider>
    )

    expect(getByText('Save Template')).toBeTruthy()
    expect(getByPlaceholderText('e.g., Healthy Weekday')).toBeTruthy()
  })

  it('calls onSave with input text', () => {
    const { getByText, getByPlaceholderText } = render(
      <ThemeProvider>
        <SaveTemplateModal visible={true} onSave={onSave} onClose={onClose} />
      </ThemeProvider>
    )

    const input = getByPlaceholderText('e.g., Healthy Weekday')
    fireEvent.changeText(input, 'My new template')

    const saveButton = getByText('Save Template')
    fireEvent.press(saveButton)

    expect(onSave).toHaveBeenCalledWith('My new template')
  })
})
