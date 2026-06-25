import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import FloatingActionButton from '@/components/FloatingActionButton/FloatingActionButton'
import SaveTemplateModal from '@/components/SaveTemplateModal/SaveTemplateModal'
import AddDishToTemplateModal from '@/components/AddDishToTemplateModal/AddDishToTemplateModal'
import { getScheduleForDate } from '@/db/scheduleRepository/scheduleRepository'
import { createTemplate } from '@/db/templateRepository/templateRepository'
import { ScheduleCard } from '@/screens/Schedule/components/ScheduleCard/ScheduleCard'
import { useTheme } from '@/theme/ThemeContext'
import { CATEGORIES, Category, Dish, ScheduleItem } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated'
import { styles } from './CreateTemplateScreen.styles'


const getCategoryEmoji = (cat: string): string => {
  const emojis: Record<string, string> = {
    Breakfast: '🌅',
    Soup: '🍲',
    'Main Course': '🥩',
    Salad: '🥗',
    Dessert: '🍰',
    Drink: '🥤',
  }
  return emojis[cat] || '🍽️'
}

export default function CreateTemplateScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ date: string }>()
  const date = Array.isArray(params.date) ? params.date[0] : params.date || ''

  const [items, setItems] = useState<ScheduleItem[]>([])
  
  // Modals state
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ScheduleItem | null>(null)
  
  // Add dish state
  const [addDishCategory, setAddDishCategory] = useState<Category | null>(null)

  const loadData = useCallback(async () => {
    if (!date) return
    const scheduleItems = await getScheduleForDate(date)
    setItems(scheduleItems)
  }, [date])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData]),
  )

  const handleRemove = () => {
    if (removeTarget) {
      setItems((prev) => prev.filter((it) => it.id !== removeTarget.id))
      setRemoveTarget(null)
    }
  }

  const handleSave = async (name: string) => {
    setShowSaveModal(false)
    try {
      await createTemplate({
        name,
        items: items.map(it => ({ dishId: it.dishId, category: it.category }))
      })
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Failed to save template')
    }
  }

  const handleCancel = () => {
    setShowCancelModal(false)
    router.back()
  }

  const handleAddDish = (dish: Dish) => {
    if (!addDishCategory) return
    const newItem: ScheduleItem = {
      id: Date.now() + Math.random(), // temp id
      dishId: dish.id,
      category: addDishCategory,
      date: date,
      dishName: dish.name,
      dishPhotoUri: dish.photoUri,
    }
    setItems((prev) => [...prev, newItem])
    setAddDishCategory(null)
  }

  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ScheduleItem[]>)

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Create Template</Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
          Based on {date}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.scroll}
      >
        {CATEGORIES.map((category) => (
          <Animated.View
            key={category}
            entering={FadeInDown.delay(100).duration(400)}
            layout={LinearTransition.springify()}
            style={styles.categorySection}
          >
            <View style={styles.categorySectionHeader}>
              <Text style={styles.categorySectionEmoji}>{getCategoryEmoji(category)}</Text>
              <Text style={[styles.categorySectionTitle, { color: colors.text }]}>
                {category}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              {/* Add Button */}
              <View style={styles.addButtonWrapper}>
                <Pressable
                  style={[styles.addButton, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
                  onPress={() => setAddDishCategory(category)}
                >
                  <MaterialCommunityIcons name="plus" size={32} color={colors.primary} />
                </Pressable>
              </View>

              {/* Items */}
              {grouped[category]?.map((item) => (
                <ScheduleCard key={item.id} item={item} onRemove={() => setRemoveTarget(item)} />
              ))}
            </ScrollView>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Absolute Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Pressable
          style={[styles.bottomBtn, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => setShowCancelModal(true)}
        >
          <Text style={[styles.bottomBtnText, { color: colors.text }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.bottomBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowSaveModal(true)}
        >
          <Text style={[styles.bottomBtnText, { color: '#fff' }]}>Save</Text>
        </Pressable>
      </View>

      {/* Modals */}
      <SaveTemplateModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
      />

      <ConfirmModal
        visible={showCancelModal}
        title="Cancel Creation"
        message="Are you sure you want to cancel? All changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="No, Keep Editing"
        confirmColor={colors.danger}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />

      <ConfirmModal
        visible={removeTarget !== null}
        title="Remove Dish"
        message={`Remove "${removeTarget?.dishName}" from this template?`}
        confirmText="Remove"
        cancelText="Keep it"
        confirmColor={colors.danger}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />

      <AddDishToTemplateModal
        visible={addDishCategory !== null}
        category={addDishCategory}
        onClose={() => setAddDishCategory(null)}
        onAdd={handleAddDish}
      />
    </View>
  )
}
