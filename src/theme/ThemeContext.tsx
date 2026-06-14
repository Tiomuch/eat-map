import React, { createContext, useContext, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { Colors, darkColors, lightColors } from './colors'

interface ThemeContextType {
  colors: Colors
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const value = useMemo(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
    }),
    [isDark],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext)
}
