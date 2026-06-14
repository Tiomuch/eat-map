import React from 'react'
import { Text, Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useTheme } from '@/theme/ThemeContext'
import { Category } from '@/types/dish'
import { styles } from './CategoryChip.styles'

interface CategoryChipProps {
  category: Category
  isSelected: boolean
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function CategoryChip({
  category,
  isSelected,
  onPress,
}: CategoryChipProps) {
  const { colors } = useTheme()
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        animatedStyle,
        {
          backgroundColor: isSelected ? colors.primary : colors.categoryChip,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: isSelected ? '#FFFFFF' : colors.categoryChipText,
            fontWeight: isSelected ? '700' : '500',
          },
        ]}
      >
        {category}
      </Text>
    </AnimatedPressable>
  )
}
