import { useTheme } from '@/theme/ThemeContext'
import { Dish } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { styles } from './DishCard.styles'

interface DishCardProps {
  dish: Dish
  onPress?: () => void
  isCenter?: boolean
  showScheduleButton?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function DishCard({
  dish,
  onPress,
  isCenter = false,
  showScheduleButton = true,
}: DishCardProps) {
  const { colors } = useTheme()
  const router = useRouter()

  const handleSchedulePress = () => {
    router.push({
      pathname: '/schedule/add',
      params: {
        dishId: dish.id,
        dishName: dish.name,
        dishPhoto: encodeURIComponent(dish.photoUri || ''),
        dishCategory: dish.category,
      },
    } as any)
  }

  return (
    <AnimatedPressable
      entering={FadeIn.duration(300)}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.cardShadow,
          borderColor: isCenter ? colors.primary : 'transparent',
          borderWidth: isCenter ? 2 : 0,
        },
      ]}
    >
      <View style={styles.imageContainer}>
        {dish.photoUri ? (
          <Image source={{ uri: dish.photoUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.placeholderEmoji]}>🍽️</Text>
          </View>
        )}
        <View style={styles.gradient} />
        <View style={styles.nameOverlay}>
          <Text style={styles.dishName} numberOfLines={2}>
            {dish.name}
          </Text>
        </View>

        {/* Schedule icon button */}
        {showScheduleButton && (
          <Pressable
            onPress={handleSchedulePress}
            style={[styles.scheduleIconButton, { backgroundColor: 'rgba(245, 158, 11, 0.9)' }]}
            hitSlop={6}
          >
            <MaterialCommunityIcons name="calendar-clock" size={18} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </AnimatedPressable>
  )
}
