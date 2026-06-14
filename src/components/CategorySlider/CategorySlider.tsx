import DishCard from '@/components/DishCard/DishCard'
import { useTheme } from '@/theme/ThemeContext'
import { Category, Dish } from '@/types/dish'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { Dimensions, Text, View } from 'react-native'
import Animated, { FadeInDown, interpolate } from 'react-native-reanimated'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import { styles } from './CategorySlider.styles'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
const CARD_WIDTH = SCREEN_WIDTH * 0.7
const CARD_HEIGHT = SCREEN_HEIGHT * 0.45

export interface CategorySliderHandle {
  scrollToRandom: () => void
}

interface CategorySliderProps {
  category: Category
  dishes: Dish[]
  onDishPress: (dish: Dish) => void
}

export const CategorySlider = forwardRef<CategorySliderHandle, CategorySliderProps>(
  function CategorySlider({ category, dishes, onDishPress }, ref) {
    const { colors } = useTheme()
    const carouselRef = useRef<ICarouselInstance>(null)

    const getCategoryEmoji = (cat: Category): string => {
      const emojis: Record<Category, string> = {
        Breakfast: '🌅',
        Soup: '🍲',
        'Main Course': '🥩',
        Salad: '🥗',
        Dessert: '🍰',
        Drink: '🥤',
      }
      return emojis[cat]
    }

    useImperativeHandle(ref, () => ({
      scrollToRandom: () => {
        if (dishes.length === 0) return
        const randomIndex = Math.floor(Math.random() * dishes.length)
        carouselRef.current?.scrollTo({
          index: randomIndex,
          animated: true,
        })
      },
    }))

    const animationStyle = useCallback((value: number) => {
      'worklet'

      // Calculate exact offset for a 20px gap
      const GAP = 20
      const offset = CARD_WIDTH * 0.925 + GAP
      const translateX = interpolate(value, [-1, 0, 1], [-offset, 0, offset])
      const scale = interpolate(value, [-1, 0, 1], [0.85, 1, 0.85])
      const opacity = interpolate(value, [-1, 0, 1], [0.5, 1, 0.5])

      return {
        transform: [{ translateX }, { scale }],
        opacity,
        zIndex: interpolate(value, [-1, 0, 1], [0, 10, 0]),
      }
    }, [])

    if (dishes.length === 0) {
      return (
        <View style={[styles.categoryPage, { height: SCREEN_HEIGHT }]}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(category)}</Text>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No dishes yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Tap + to add your first {category.toLowerCase()} dish
            </Text>
          </View>
        </View>
      )
    }

    return (
      <View style={[styles.categoryPage, { height: SCREEN_HEIGHT }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.categoryHeader}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(category)}</Text>
          <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
          <Text style={[styles.dishCount, { color: colors.textTertiary }]}>
            {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'}
          </Text>
        </Animated.View>

        <View style={styles.carouselContainer}>
          <Carousel
            ref={carouselRef}
            loop
            width={SCREEN_WIDTH}
            height={CARD_HEIGHT}
            data={dishes}
            customAnimation={animationStyle}
            scrollAnimationDuration={600}
            renderItem={({ item, index }) => (
              <View
                style={[styles.cardWrapper, { paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 }]}
                key={`${item.id}-${index}`}
              >
                <DishCard dish={item} onPress={() => onDishPress(item)} />
              </View>
            )}
          />
        </View>
      </View>
    )
  },
)

export default CategorySlider
