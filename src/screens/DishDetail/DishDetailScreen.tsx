import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import FloatingActionButton from '@/components/FloatingActionButton/FloatingActionButton'
import { deleteDish, getDishById } from '@/db/dishRepository/dishRepository'
import { useTheme } from '@/theme/ThemeContext'
import { Dish } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from 'react-native-reanimated'
import { styles } from './DishDetailScreen.styles'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors } = useTheme()
  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Scroll tracking states
  const [contentHeight, setContentHeight] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const isScrollable = contentHeight > containerHeight && containerHeight > 0

  useEffect(() => {
    async function load() {
      if (id) {
        const result = await getDishById(Number(id))
        setDish(result)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (dish) {
      await deleteDish(dish.id)
      setShowDeleteModal(false)
      router.back()
    }
  }

  const handleEdit = () => {
    if (dish) {
      router.push(`/dish/edit/${dish.id}`)
    }
  }

  const handleSchedule = () => {
    if (dish) {
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
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 10
    setIsAtBottom(isBottom)
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!dish) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Dish not found</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <Animated.View entering={FadeInUp.duration(500)}>
          <View style={styles.heroContainer}>
            {dish.photoUri ? (
              <Image source={{ uri: dish.photoUri }} style={styles.heroImage} contentFit="cover" />
            ) : (
              <View style={[styles.heroPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={{ fontSize: 80 }}>🍽️</Text>
              </View>
            )}
            <View style={styles.heroOverlay} />

            {/* Back button */}
            <Animated.View style={styles.backButton}>
              <FloatingActionButton
                icon="arrow-left"
                color={colors.text}
                backgroundColor={colors.surface + 'DD'}
                onPress={() => router.back()}
                size={44}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            {/* Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: colors.categoryChip }]}>
              <Text style={[styles.categoryBadgeText, { color: colors.categoryChipText }]}>
                {dish.category}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <Text style={[styles.dishName, { color: colors.text }]}>{dish.name}</Text>
          </Animated.View>

          {/* Decorative divider */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={styles.dividerIcon}>✦</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>DESCRIPTION</Text>
            <View style={styles.descriptionContainer}>
              <ScrollView
                style={styles.descriptionScroll}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                scrollEventThrottle={16}
                onScroll={handleScroll}
                onContentSizeChange={(w, h) => setContentHeight(h)}
                onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
              >
                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                  {dish.description || 'No description added yet.'}
                </Text>
              </ScrollView>

              {isScrollable && !isAtBottom && (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  exiting={FadeOut.duration(300)}
                  style={[styles.scrollIndicator, { backgroundColor: colors.background + 'E6' }]}
                  pointerEvents="none"
                >
                  <MaterialCommunityIcons
                    name="chevron-double-down"
                    size={24}
                    color={colors.primary}
                  />
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Meta info */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={[styles.metaCard, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>Added</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {new Date(dish.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons — horizontal row */}
      <View style={styles.fabContainer}>
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <FloatingActionButton
            icon="pencil-outline"
            color="#FFFFFF"
            backgroundColor={colors.info}
            onPress={handleEdit}
            size={52}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(550).duration(400)}>
          <FloatingActionButton
            icon="calendar-clock"
            color="#FFFFFF"
            backgroundColor={colors.warning}
            onPress={handleSchedule}
            size={52}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <FloatingActionButton
            icon="trash-can-outline"
            color="#FFFFFF"
            backgroundColor={colors.danger}
            onPress={() => setShowDeleteModal(true)}
            size={52}
          />
        </Animated.View>
      </View>

      {/* Delete Confirmation */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Dish"
        message={`Are you sure you want to delete "${dish.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep it"
        confirmColor={colors.danger}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  )
}
