import { useTheme } from '@/theme/ThemeContext'
import { Template } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { styles } from './TemplateCard.styles'


interface TemplateCardProps {
  template: Template
  onPress: () => void
  onDelete: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const TRANSLATE_X_THRESHOLD = -SCREEN_WIDTH * 0.4

export default function TemplateCard({ template, onPress, onDelete }: TemplateCardProps) {
  const { colors } = useTheme()
  const translateX = useSharedValue(0)
  const itemHeight = useSharedValue(-1) // for collapse animation
  const opacity = useSharedValue(1)
  const [measuredHeight, setMeasuredHeight] = useState(0)

  const performDelete = () => {
    if (itemHeight.value === -1 && measuredHeight > 0) {
      itemHeight.value = measuredHeight
    }
    opacity.value = withTiming(0, { duration: 200 })
    itemHeight.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onDelete)()
    })
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Only allow swipe to left
      if (event.translationX < 0) {
        translateX.value = event.translationX
      }
    })
    .onEnd((event) => {
      if (translateX.value < TRANSLATE_X_THRESHOLD) {
        // Swipe was far enough, trigger delete
        translateX.value = withTiming(-SCREEN_WIDTH, {}, () => {
          runOnJS(performDelete)()
        })
      } else if (translateX.value < -80) {
        // Snap to reveal delete button
        translateX.value = withSpring(-80)
      } else {
        // Snap back
        translateX.value = withSpring(0)
      }
    })

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const rContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      height: itemHeight.value === -1 ? 'auto' : itemHeight.value,
      marginBottom: itemHeight.value === -1 ? styles.container.marginBottom : 0,
    }
  })

  // We'll format the date
  const formattedDate = new Date(template.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Animated.View 
      style={[styles.container, rContainerStyle]}
      onLayout={(e) => {
        if (measuredHeight === 0) setMeasuredHeight(e.nativeEvent.layout.height)
      }}
    >
      {/* Background action (Delete) */}
      <View style={[styles.deleteBackground, { backgroundColor: colors.danger }]}>
        <Pressable
          style={styles.deleteButtonPressable}
          onPress={() => {
            translateX.value = withTiming(-SCREEN_WIDTH, {}, () => {
              runOnJS(performDelete)()
            })
          }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Foreground card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, { backgroundColor: colors.surface }, rStyle]}>
          <Pressable style={styles.content} onPress={onPress}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{template.name}</Text>
              <Text style={[styles.date, { color: colors.textSecondary }]}>{formattedDate}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  )
}
