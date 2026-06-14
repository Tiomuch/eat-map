import React from 'react'
import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@/theme/ThemeContext'
import { styles } from './DishPreviewCard.styles'

interface DishPreviewCardProps {
  dishName: string
  dishPhoto: string
  dishCategory: string
}

export default function DishPreviewCard({
  dishName,
  dishPhoto,
  dishCategory,
}: DishPreviewCardProps) {
  const { colors } = useTheme()

  return (
    <View style={[styles.dishPreview, { backgroundColor: colors.surface }]}>
      <View style={[styles.dishPreviewImageWrap, { backgroundColor: colors.surfaceVariant }]}>
        {dishPhoto ? (
          <Image
            source={{ uri: dishPhoto }}
            style={styles.dishPreviewImage}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.dishPreviewPlaceholder}>🍽️</Text>
        )}
      </View>
      <View style={styles.dishPreviewInfo}>
        <Text style={[styles.dishPreviewName, { color: colors.text }]} numberOfLines={2}>
          {dishName}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: colors.categoryChip }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.categoryChipText }]}>
            {dishCategory}
          </Text>
        </View>
      </View>
    </View>
  )
}
