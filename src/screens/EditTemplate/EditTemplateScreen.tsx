import ChooseDayModal from '@/components/ChooseDayModal/ChooseDayModal'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import FloatingActionButton from '@/components/FloatingActionButton/FloatingActionButton'
import AddDishToTemplateModal from '@/components/AddDishToTemplateModal/AddDishToTemplateModal'
import { getTemplate, getTemplateItems, updateTemplate, isTemplateNameUnique, deleteTemplate } from '@/db/templateRepository/templateRepository'
import { addToSchedule, clearScheduleForDate } from '@/db/scheduleRepository/scheduleRepository'
import { ScheduleCard } from '@/screens/Schedule/components/ScheduleCard/ScheduleCard'
import { useTheme } from '@/theme/ThemeContext'
import { CATEGORIES, Category, Dish, ScheduleItem, TemplateItem } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated'
import { styles } from '../CreateTemplate/CreateTemplateScreen.styles' // reuse styles

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

export default function EditTemplateScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const templateId = Number(params.id)

  const [items, setItems] = useState<TemplateItem[]>([])
  const [initialItemsStr, setInitialItemsStr] = useState<string>('[]')
  
  const [templateName, setTemplateName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showChooseDayModal, setShowChooseDayModal] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<TemplateItem | null>(null)
  
  // Add dish state
  const [addDishCategory, setAddDishCategory] = useState<Category | null>(null)

  const loadData = useCallback(async () => {
    if (!templateId) return
    const template = await getTemplate(templateId)
    if (template) {
      setTemplateName(template.name)
      setOriginalName(template.name)
    }
    const templateItems = await getTemplateItems(templateId)
    setItems(templateItems)
    setInitialItemsStr(JSON.stringify(templateItems))
  }, [templateId])

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

  const handleSave = async () => {
    const trimmedName = templateName.trim()
    if (!trimmedName) {
      setNameError('Template name cannot be empty')
      return
    }

    if (trimmedName !== originalName) {
      const isUnique = await isTemplateNameUnique(trimmedName, templateId)
      if (!isUnique) {
        setNameError('A template with this name already exists')
        return
      }
    }

    try {
      await updateTemplate(
        templateId,
        trimmedName,
        items.map((it) => ({ dishId: it.dishId, category: it.category })),
      )
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Failed to save template')
    }
  }

  const handleApplyTemplate = async (date: string) => {
    const trimmedName = templateName.trim()
    if (!trimmedName) {
      setNameError('Template name cannot be empty')
      setShowChooseDayModal(false)
      return
    }

    if (trimmedName !== originalName) {
      const isUnique = await isTemplateNameUnique(trimmedName, templateId)
      if (!isUnique) {
        setNameError('A template with this name already exists')
        setShowChooseDayModal(false)
        return
      }
    }

    setShowChooseDayModal(false)
    try {
      await updateTemplate(
        templateId,
        trimmedName,
        items.map((it) => ({ dishId: it.dishId, category: it.category })),
      )
      
      await clearScheduleForDate(date)
      for (const item of items) {
        await addToSchedule(item.dishId, date, item.category)
      }

      router.back()
    } catch (e) {
      Alert.alert('Error', 'Failed to apply template')
    }
  }

  const handleCancelPress = () => {
    const hasChanges = JSON.stringify(items) !== initialItemsStr || templateName.trim() !== originalName
    if (hasChanges) {
      setShowCancelModal(true)
    } else {
      router.back()
    }
  }

  const handleCancel = () => {
    setShowCancelModal(false)
    router.back()
  }

  const handleDeleteTemplate = () => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(templateId)
            router.back()
          },
        },
      ]
    )
  }

  const handleAddDish = (dish: Dish) => {
    if (!addDishCategory) return
    const newItem: TemplateItem = {
      id: Date.now() + Math.random(), // temp id
      templateId: templateId,
      dishId: dish.id,
      category: addDishCategory,
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
  }, {} as Record<string, TemplateItem[]>)

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <FloatingActionButton
            icon="arrow-left"
            color={colors.text}
            backgroundColor={colors.surfaceVariant}
            onPress={handleCancelPress}
            size={44}
          />
          <Text style={[styles.title, { color: colors.text }]}>Edit Template</Text>
          <View style={{ width: 44 }} />
        </View>
        <TextInput
          style={[
            {
              fontSize: 16,
              fontWeight: '500',
              color: colors.text,
              backgroundColor: colors.surfaceVariant,
              padding: 12,
              borderRadius: 12,
              width: '100%',
              marginTop: 16,
              borderColor: nameError ? colors.danger : colors.border,
              borderWidth: 1,
            }
          ]}
          value={templateName}
          onChangeText={(text) => {
            setTemplateName(text)
            if (nameError) setNameError(null)
          }}
          placeholder="Template Name"
          placeholderTextColor={colors.textTertiary}
        />
        {nameError ? (
          <Text style={{ color: colors.danger, marginTop: 4, fontSize: 12, alignSelf: 'flex-start' }}>
            {nameError}
          </Text>
        ) : null}
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
                <ScheduleCard
                  key={item.id}
                  item={item as unknown as ScheduleItem}
                  onRemove={() => setRemoveTarget(item)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Absolute Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Pressable
          style={[styles.bottomBtn, { backgroundColor: colors.danger }]}
          onPress={handleDeleteTemplate}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#fff" />
        </Pressable>
        <Pressable
          style={[styles.bottomBtn, { backgroundColor: colors.surfaceVariant }]}
          onPress={handleCancelPress}
        >
          <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          style={[styles.bottomBtn, { backgroundColor: items.length === 0 ? colors.surfaceVariant : colors.primary }]}
          disabled={items.length === 0}
          onPress={() => setShowChooseDayModal(true)}
        >
          <MaterialCommunityIcons name="calendar-arrow-right" size={24} color={items.length === 0 ? colors.textTertiary : '#fff'} />
        </Pressable>
        <Pressable
          style={[styles.bottomBtn, { backgroundColor: items.length === 0 || !templateName.trim() ? colors.surfaceVariant : '#10b981' }]}
          disabled={items.length === 0 || !templateName.trim()}
          onPress={handleSave}
        >
          <MaterialCommunityIcons name="check" size={24} color={items.length === 0 || !templateName.trim() ? colors.textTertiary : '#fff'} />
        </Pressable>
      </View>

      <ConfirmModal
        visible={showCancelModal}
        title="Cancel Editing"
        message="Are you sure you want to cancel? Unsaved changes will be lost."
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

      <ChooseDayModal
        visible={showChooseDayModal}
        onClose={() => setShowChooseDayModal(false)}
        onApply={handleApplyTemplate}
      />
    </View>
  )
}
