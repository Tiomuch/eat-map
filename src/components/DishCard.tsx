import { useTheme } from '@/theme/ThemeContext'
import { Dish } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

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

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
    // Using a semi-transparent overlay instead of LinearGradient for simplicity
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  dishName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scheduleIconButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
})
