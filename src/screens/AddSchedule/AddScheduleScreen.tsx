import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import FloatingActionButton from '@/components/FloatingActionButton/FloatingActionButton'
import DishPreviewCard from '@/components/DishPreviewCard/DishPreviewCard'
import DayChipsPicker from '@/components/DayChipsPicker/DayChipsPicker'
import { addToSchedule, getWeekDates, isDishScheduledForDate } from '@/db/scheduleRepository'
import { useTheme } from '@/theme/ThemeContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import { styles } from './AddScheduleScreen.styles'

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface DayChip {
  date: string
  dayShort: string
  dayNum: number
  isToday: boolean
}

function buildDayChips(): DayChip[] {
  const dates = getWeekDates()
  return dates.map((dateStr, index) => {
    const d = new Date(dateStr + 'T12:00:00')
    return {
      date: dateStr,
      dayShort: DAY_NAMES_SHORT[d.getDay()],
      dayNum: d.getDate(),
      isToday: index === 0,
    }
  })
}

export default function AddToScheduleScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const params = useLocalSearchParams<{
    dishId: string
    dishName: string
    dishPhoto: string
    dishCategory: string
  }>()

  const dishId = Number(params.dishId)
  const dishName = Array.isArray(params.dishName) ? params.dishName[0] : params.dishName || ''
  const dishPhotoRaw = Array.isArray(params.dishPhoto)
    ? params.dishPhoto[0]
    : params.dishPhoto || ''
  const dishCategory = Array.isArray(params.dishCategory)
    ? params.dishCategory[0]
    : params.dishCategory || ''

  const [dayChips] = useState<DayChip[]>(buildDayChips)
  const [selectedDate, setSelectedDate] = useState<string>(dayChips[0]?.date || '')
  const [saving, setSaving] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleAddPress = () => {
    if (!selectedDate || !dishId) return
    setShowConfirmModal(true)
  }

  const executeAdd = async () => {
    setShowConfirmModal(false)

    setSaving(true)
    try {
      // Check for duplicate
      const alreadyScheduled = await isDishScheduledForDate(dishId, selectedDate)
      if (alreadyScheduled) {
        setSaving(false)
        setShowDuplicateModal(true)
        return
      }

      await addToSchedule(dishId, selectedDate, dishCategory)
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/schedule' as any)
      }
    } catch {
      Alert.alert('Error', 'Failed to add to schedule. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectedDayInfo = dayChips.find((c) => c.date === selectedDate)
  const selectedLabel = selectedDayInfo?.isToday
    ? 'Today'
    : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50).duration(300)}>
          <View style={styles.header}>
            <FloatingActionButton
              icon="arrow-left"
              color={colors.text}
              backgroundColor={colors.surfaceVariant}
              onPress={() => router.back()}
              size={44}
            />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Add to Schedule</Text>
            <View style={{ width: 44 }} />
          </View>
        </Animated.View>

        {/* Dish Preview Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <DishPreviewCard
            dishName={dishName}
            dishPhoto={dishPhotoRaw}
            dishCategory={dishCategory}
          />
        </Animated.View>

        {/* Date Picker */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pick a Day</Text>
            <DayChipsPicker
              dayChips={dayChips}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            {selectedDate && (
              <Animated.View entering={FadeIn.duration(200)}>
                <Text style={[styles.selectedDateLabel, { color: colors.textTertiary }]}>
                  Scheduling for {selectedLabel}
                </Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Add Button */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.addButtonWrap}>
        <Pressable
          onPress={handleAddPress}
          disabled={saving}
          style={[
            styles.addButton,
            {
              backgroundColor: saving ? colors.textTertiary : colors.primary,
            },
          ]}
        >
          <MaterialCommunityIcons name="calendar-plus" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{saving ? 'Adding...' : 'Add to Schedule'}</Text>
        </Pressable>
      </Animated.View>

      {/* Duplicate warning modal */}
      <ConfirmModal
        visible={showDuplicateModal}
        title="Already Scheduled"
        message={`"${dishName}" is already scheduled for this day. Choose a different day or go back.`}
        confirmText="OK"
        cancelText="Go Back"
        confirmColor={colors.warning}
        onConfirm={() => setShowDuplicateModal(false)}
        onCancel={() => {
          setShowDuplicateModal(false)
          if (router.canGoBack()) {
            router.back()
          } else {
            router.replace('/schedule' as any)
          }
        }}
      />

      {/* Confirmation modal */}
      <ConfirmModal
        visible={showConfirmModal}
        title="Add to Schedule"
        message={`Do you want to add "${dishName}" to your schedule for ${selectedLabel}?`}
        confirmText="Add"
        cancelText="Cancel"
        confirmColor={colors.primary}
        onConfirm={executeAdd}
        onCancel={() => setShowConfirmModal(false)}
      />
    </View>
  )
}
