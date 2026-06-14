import { useTheme } from '@/theme/ThemeContext'
import { CATEGORIES, ScheduleItem } from '@/types/dish'
import { ScrollView, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated'
import { ScheduleCard } from '../ScheduleCard/ScheduleCard'
import { styles } from './DayPage.styles'

export interface DayData {
  date: string
  label: string // "Today", "Tomorrow", or empty
  dayName: string // "Monday", "Friday", etc.
  dateFormatted: string // "June 12"
  items: ScheduleItem[]
}

function groupByCategory(items: ScheduleItem[]): Record<string, ScheduleItem[]> {
  const grouped: Record<string, ScheduleItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) {
      grouped[item.category] = []
    }
    grouped[item.category].push(item)
  }
  return grouped
}

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

interface DayPageProps {
  day: DayData
  onRemoveItem: (item: ScheduleItem) => void
}

export function DayPage({ day, onRemoveItem }: DayPageProps) {
  const { colors } = useTheme()
  const grouped = groupByCategory(day.items)
  const categoryOrder = CATEGORIES.filter((c) => grouped[c])

  return (
    <View style={styles.dayPage}>
      {/* Day Header */}
      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.dayHeader}>
        <Text style={[styles.dayName, { color: colors.text }]}>{day.dayName}</Text>
        <Text style={[styles.dayDate, { color: colors.textTertiary }]}>{day.dateFormatted}</Text>
        {day.label !== '' && (
          <Text style={[styles.dayLabel, { color: colors.primary }]}>{day.label}</Text>
        )}
      </Animated.View>

      {/* Content */}
      {day.items.length === 0 ? (
        <View style={styles.emptyDayContainer}>
          <Text style={styles.emptyDayEmoji}>😿🍽️</Text>
          <Text style={[styles.emptyDayTitle, { color: colors.textSecondary }]}>
            Nothing to eat!
          </Text>
          <Text style={[styles.emptyDaySubtitle, { color: colors.textTertiary }]}>
            Your plate is empty for this day
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.dayCategoriesContent}
          style={styles.dayCategoriesScroll}
        >
          {categoryOrder.map((category) => (
            <Animated.View
              key={category}
              entering={FadeInDown.delay(100).duration(400)}
              exiting={FadeOutDown.duration(300)}
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
                {grouped[category].map((item) => (
                  <ScheduleCard key={item.id} item={item} onRemove={onRemoveItem} />
                ))}
              </ScrollView>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

export default DayPage
