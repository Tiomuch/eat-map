import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, Text } from 'react-native'
import { useTheme } from '@/theme/ThemeContext'
import { initDatabase } from '@/db/database'
import { styles } from './AppContent.styles'

export default function AppContent() {
  const { colors, isDark } = useTheme()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        await initDatabase()
        setIsReady(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to initialize database')
      }
    }
    init()
  }, [])

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>Error: {error}</Text>
      </View>
    )
  }

  if (!isReady) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Preparing your dishes...
        </Text>
      </View>
    )
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  )
}
