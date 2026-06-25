import DishCard from '@/components/DishCard/DishCard'
import { getDishesByCategory } from '@/db/dishRepository/dishRepository'
import { useTheme } from '@/theme/ThemeContext'
import { Category, Dish } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCallback, useEffect, useState } from 'react'
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, interpolate } from 'react-native-reanimated'
import Carousel from 'react-native-reanimated-carousel'
import { styles } from './AddDishToTemplateModal.styles'


interface AddDishToTemplateModalProps {
  visible: boolean
  category: Category | null
  onAdd: (dish: Dish) => void
  onClose: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const MODAL_WIDTH = Math.min(SCREEN_WIDTH - 48, 400)
const CARD_WIDTH = MODAL_WIDTH * 0.75
const CARD_HEIGHT = MODAL_WIDTH * 0.95

export default function AddDishToTemplateModal({
  visible,
  category,
  onAdd,
  onClose,
}: AddDishToTemplateModalProps) {
  const { colors } = useTheme()
  const [dishes, setDishes] = useState<Dish[]>([])

  useEffect(() => {
    if (visible && category) {
      loadDishes()
    }
  }, [visible, category])

  const loadDishes = async () => {
    if (!category) return
    const fetched = await getDishesByCategory(category)
    setDishes(fetched)
  }

  const animationStyle = useCallback((value: number) => {
    'worklet'
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

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.backdrop]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modal, { backgroundColor: colors.surface }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Add {category}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={{ height: CARD_HEIGHT, marginTop: 16, justifyContent: 'center' }}>
            {dishes.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                No dishes found for this category.
              </Text>
            ) : (
              <Carousel
                loop={dishes.length > 1}
                width={MODAL_WIDTH}
                height={CARD_HEIGHT}
                data={dishes}
                customAnimation={animationStyle}
                scrollAnimationDuration={600}
                renderItem={({ item, index }) => (
                  <View
                    style={[styles.cardWrapper, { paddingHorizontal: (MODAL_WIDTH - CARD_WIDTH) / 2 }]}
                    key={`${item.id}-${index}`}
                  >
                    <DishCard dish={item} onPress={() => onAdd(item)} showScheduleButton={false} />
                  </View>
                )}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
