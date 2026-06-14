import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemeProvider } from '@/theme/ThemeContext'
import AppContent from '@/components/AppContent/AppContent'
import { styles } from '@/components/AppContent/AppContent.styles'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
