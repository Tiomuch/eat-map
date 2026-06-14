import { CategorySlider, CategorySliderHandle } from '@/components/CategorySlider/CategorySlider'
import { getDishesByCategory } from '@/db/dishRepository'
import { useTheme } from '@/theme/ThemeContext'
import { CATEGORIES, Category, Dish } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { Dimensions, FlatList, Pressable, Text, View, ViewToken } from 'react-native'
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { styles } from './HomeScreen.styles'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function MainScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [dishesByCategory, setDishesByCategory] = useState<Record<Category, Dish[]>>(
    {} as Record<Category, Dish[]>,
  )
  const [currentIndex, setCurrentIndex] = useState(0)

  // Refs for each category slider
  const sliderRefs = useRef<Record<number, CategorySliderHandle | null>>({})

  const randomScale = useSharedValue(1)

  const randomButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: randomScale.value }],
  }))

  const loadDishes = useCallback(async () => {
    const result: Record<string, Dish[]> = {}
    for (const category of CATEGORIES) {
      result[category] = await getDishesByCategory(category)
    }
    setDishesByCategory(result as Record<Category, Dish[]>)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadDishes()
    }, [loadDishes]),
  )

  const handleDishPress = (dish: Dish) => {
    router.push(`/dish/${dish.id}`)
  }

  const handleAddPress = () => {
    router.push('/dish/add')
  }

  const handleSchedulePress = () => {
    router.push('/schedule' as any)
  }

  const handleRandom = () => {
    const currentDishes = dishesByCategory[CATEGORIES[currentIndex]] || []
    if (currentDishes.length === 0) return

    randomScale.value = withSequence(
      withTiming(0.85, { duration: 200 }),
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 200 }),
    )

    sliderRefs.current[currentIndex]?.scrollToRandom()
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index)
    }
  }).current

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={({ item: category, index }) => (
          <CategorySlider
            ref={(handle) => {
              sliderRefs.current[index] = handle
            }}
            category={category}
            dishes={dishesByCategory[category] || []}
            onDishPress={handleDishPress}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* Category indicator dots */}
      <View style={[styles.dotsContainer, { backgroundColor: colors.surface + 'CC' }]}>
        {CATEGORIES.map((cat, index) => (
          <View
            key={cat}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.border,
                width: index === currentIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Floating action buttons — absolute, always visible */}
      <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.floatingButtonBar}>
        {/* Random button */}
        <Animated.View style={randomButtonStyle}>
          <Pressable
            onPress={handleRandom}
            style={[styles.randomButton, { backgroundColor: colors.primary }]}
          >
            <MaterialCommunityIcons name="dice-multiple-outline" size={22} color="#FFFFFF" />
            <Text style={styles.randomButtonText}>Random</Text>
          </Pressable>
        </Animated.View>

        {/* Add button */}
        <Pressable
          onPress={handleAddPress}
          style={[styles.plusButton, { backgroundColor: colors.success }]}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
        </Pressable>

        {/* Schedule button */}
        <Pressable
          onPress={handleSchedulePress}
          style={[styles.scheduleButton, { backgroundColor: colors.warning }]}
        >
          <MaterialCommunityIcons name="calendar-week" size={24} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </View>
  )
}
