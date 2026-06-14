import React from 'react'
import { Pressable } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { styles } from './FloatingActionButton.styles'

interface FloatingActionButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  color: string
  backgroundColor: string
  onPress: () => void
  size?: number
  style?: object
  testID?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function FloatingActionButton({
  icon,
  color,
  backgroundColor,
  onPress,
  size = 56,
  style,
  testID,
}: FloatingActionButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      style={[
        styles.fab,
        animatedStyle,
        {
          backgroundColor,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons name={icon} size={size * 0.45} color={color} />
    </AnimatedPressable>
  )
}
