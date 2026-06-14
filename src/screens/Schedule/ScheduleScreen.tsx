import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import FloatingActionButton from '@/components/FloatingActionButton/FloatingActionButton'
import {
  cleanupPastScheduleItems,
  getScheduleForWeek,
  getWeekDates,
  removeFromSchedule,
} from '@/db/scheduleRepository'
import { useTheme } from '@/theme/ThemeContext'
import { ScheduleItem } from '@/types/dish'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { DayData, DayPage } from './components/DayPage/DayPage'
import { styles } from './ScheduleScreen.styles'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function buildDayData(dates: string[], schedule: Record<string, ScheduleItem[]>): DayData[] {
  return dates.map((dateStr, index) => {
    const dateObj = new Date(dateStr + 'T12:00:00') // noon to avoid timezone issues
    const dayName = DAY_NAMES[dateObj.getDay()]
    const dateFormatted = dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })

    let label = ''
    if (index === 0) label = 'Today'
    else if (index === 1) label = 'Tomorrow'

    return {
      date: dateStr,
      label,
      dayName,
      dateFormatted,
      items: schedule[dateStr] || [],
    }
  })
}

export default function ScheduleScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [days, setDays] = useState<DayData[]>([])
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [removeTarget, setRemoveTarget] = useState<ScheduleItem | null>(null)

  const loadSchedule = useCallback(async () => {
    // Auto-cleanup past data
    await cleanupPastScheduleItems()

    const dates = getWeekDates()
    const schedule = await getScheduleForWeek(dates)
    setDays(buildDayData(dates, schedule))
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadSchedule()
    }, [loadSchedule]),
  )

  const handleRemove = async () => {
    if (removeTarget) {
      await removeFromSchedule(removeTarget.id)
      setRemoveTarget(null)
      await loadSchedule()
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Selected Day Content */}
      {days.length > 0 && (
        <DayPage day={days[currentDayIndex]} onRemoveItem={(it) => setRemoveTarget(it)} />
      )}

      {/* Back button */}
      <View style={styles.backButtonContainer}>
        <FloatingActionButton
          icon="arrow-left"
          color={colors.text}
          backgroundColor={colors.surfaceVariant}
          onPress={() => router.back()}
          size={44}
        />
      </View>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {days.map((day, index) => {
            const isSelected = index === currentDayIndex
            return (
              <Pressable
                key={day.date}
                onPress={() => setCurrentDayIndex(index)}
                style={[
                  styles.tab,
                  { backgroundColor: isSelected ? colors.primary : colors.surfaceVariant },
                ]}
              >
                <Text style={[styles.tabText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                  {day.label || day.dayName.substring(0, 3)}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Remove confirmation modal */}
      <ConfirmModal
        visible={removeTarget !== null}
        title="Remove from Schedule"
        message={removeTarget ? `Remove "${removeTarget.dishName}" from this day's schedule?` : ''}
        confirmText="Remove"
        cancelText="Keep it"
        confirmColor={colors.danger}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </View>
  )
}
