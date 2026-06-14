import React from 'react'
import { Text, Pressable, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useTheme } from '@/theme/ThemeContext'
import { styles } from './DayChipsPicker.styles'

interface DayChip {
  date: string
  dayShort: string
  dayNum: number
  isToday: boolean
}

interface DayChipsPickerProps {
  dayChips: DayChip[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

export default function DayChipsPicker({
  dayChips,
  selectedDate,
  onSelectDate,
}: DayChipsPickerProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.dayChipsContainer}>
      {dayChips.map((chip, index) => {
        const isSelected = chip.date === selectedDate
        return (
          <Animated.View
            key={chip.date}
            entering={FadeIn.delay(250 + index * 50).duration(300)}
          >
            <Pressable
              onPress={() => onSelectDate(chip.date)}
              style={[
                styles.dayChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayChipDay,
                  { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {chip.isToday ? 'Today' : chip.dayShort}
              </Text>
              <Text
                style={[styles.dayChipNum, { color: isSelected ? '#FFFFFF' : colors.text }]}
              >
                {chip.dayNum}
              </Text>
            </Pressable>
          </Animated.View>
        )
      })}
    </View>
  )
}
