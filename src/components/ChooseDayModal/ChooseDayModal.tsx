import DayChipsPicker from '@/components/DayChipsPicker/DayChipsPicker'
import { getWeekDates } from '@/db/scheduleRepository/scheduleRepository'
import { useTheme } from '@/theme/ThemeContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { styles } from './ChooseDayModal.styles'


interface ChooseDayModalProps {
  visible: boolean
  onApply: (date: string) => void
  onClose: () => void
}

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

export default function ChooseDayModal({ visible, onApply, onClose }: ChooseDayModalProps) {
  const { colors } = useTheme()
  const [dayChips, setDayChips] = useState<DayChip[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    if (visible) {
      const chips = buildDayChips()
      setDayChips(chips)
      setSelectedDate(chips[0]?.date || '')
    }
  }, [visible])

  const handleApply = () => {
    if (selectedDate) {
      onApply(selectedDate)
    }
  }

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
          <Text style={[styles.title, { color: colors.text }]}>Apply Template</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Pick a day to apply this template to.
          </Text>

          <View style={styles.chipsContainer}>
            <DayChipsPicker
              dayChips={dayChips}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onClose}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={handleApply}
              disabled={!selectedDate}
              style={[
                styles.button,
                styles.applyButton,
                { backgroundColor: selectedDate ? colors.primary : colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons name="check" size={24} color={selectedDate ? '#fff' : colors.textTertiary} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
