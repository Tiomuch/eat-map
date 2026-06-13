import ConfirmModal from '@/components/ConfirmModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import {
  cleanupPastScheduleItems,
  getScheduleForWeek,
  getWeekDates,
  removeFromSchedule,
} from '@/db/scheduleRepository';
import { useTheme } from '@/theme/ThemeContext';
import { CATEGORIES, ScheduleItem } from '@/types/dish';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown, LinearTransition } from 'react-native-reanimated';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DayData {
  date: string;
  label: string; // "Today", "Tomorrow", or empty
  dayName: string; // "Monday", "Friday", etc.
  dateFormatted: string; // "June 12"
  items: ScheduleItem[];
}

function buildDayData(dates: string[], schedule: Record<string, ScheduleItem[]>): DayData[] {
  return dates.map((dateStr, index) => {
    const dateObj = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone issues
    const dayName = DAY_NAMES[dateObj.getDay()];
    const dateFormatted = dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });

    let label = '';
    if (index === 0) label = 'Today';
    else if (index === 1) label = 'Tomorrow';

    return {
      date: dateStr,
      label,
      dayName,
      dateFormatted,
      items: schedule[dateStr] || [],
    };
  });
}

function groupByCategory(items: ScheduleItem[]): Record<string, ScheduleItem[]> {
  const grouped: Record<string, ScheduleItem[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  }
  return grouped;
}

const getCategoryEmoji = (cat: string): string => {
  const emojis: Record<string, string> = {
    Breakfast: '🌅',
    Soup: '🍲',
    'Main Course': '🥩',
    Salad: '🥗',
    Dessert: '🍰',
    Drink: '🥤',
  };
  return emojis[cat] || '🍽️';
};

interface ScheduleCardProps {
  item: ScheduleItem;
  onRemove: (item: ScheduleItem) => void;
}

function ScheduleCard({ item, onRemove }: ScheduleCardProps) {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.springify()}
      style={styles.scheduleCard}
    >
      <View style={[styles.scheduleCardImageWrap, { backgroundColor: colors.surfaceVariant }]}>
        {item.dishPhotoUri ? (
          <Image source={{ uri: item.dishPhotoUri }} style={styles.scheduleCardImage} contentFit="cover" />
        ) : (
          <Text style={styles.scheduleCardPlaceholderEmoji}>🍽️</Text>
        )}
        {/* Red X remove button */}
        <Pressable
          onPress={() => onRemove(item)}
          style={styles.removeButton}
          hitSlop={8}
        >
          <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
      <Text
        style={[styles.scheduleCardName, { color: colors.text }]}
        numberOfLines={2}
      >
        {item.dishName}
      </Text>
    </Animated.View>
  );
}

interface DayPageProps {
  day: DayData;
  onRemoveItem: (item: ScheduleItem) => void;
}

function DayPage({ day, onRemoveItem }: DayPageProps) {
  const { colors } = useTheme();
  const grouped = groupByCategory(day.items);
  const categoryOrder = CATEGORIES.filter((c) => grouped[c]);

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
                <Text style={styles.categorySectionEmoji}>
                  {getCategoryEmoji(category)}
                </Text>
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
                  <ScheduleCard
                    key={item.id}
                    item={item}
                    onRemove={onRemoveItem}
                  />
                ))}
              </ScrollView>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [days, setDays] = useState<DayData[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [removeTarget, setRemoveTarget] = useState<ScheduleItem | null>(null);

  const loadSchedule = useCallback(async () => {
    // Auto-cleanup past data
    await cleanupPastScheduleItems();

    const dates = getWeekDates();
    const schedule = await getScheduleForWeek(dates);
    setDays(buildDayData(dates, schedule));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSchedule();
    }, [loadSchedule]),
  );

  const handleRemove = async () => {
    if (removeTarget) {
      await removeFromSchedule(removeTarget.id);
      setRemoveTarget(null);
      await loadSchedule();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Selected Day Content */}
      {days.length > 0 && (
        <DayPage
          day={days[currentDayIndex]}
          onRemoveItem={(it) => setRemoveTarget(it)}
        />
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
            const isSelected = index === currentDayIndex;
            return (
              <Pressable
                key={day.date}
                onPress={() => setCurrentDayIndex(index)}
                style={[
                  styles.tab,
                  { backgroundColor: isSelected ? colors.primary : colors.surfaceVariant }
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isSelected ? '#FFFFFF' : colors.text }
                  ]}
                >
                  {day.label || day.dayName.substring(0, 3)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Remove confirmation modal */}
      <ConfirmModal
        visible={removeTarget !== null}
        title="Remove from Schedule"
        message={
          removeTarget
            ? `Remove "${removeTarget.dishName}" from this day's schedule?`
            : ''
        }
        confirmText="Remove"
        cancelText="Keep it"
        confirmColor={colors.danger}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomTabsContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dayPage: {
    flex: 1,
    paddingTop: 60,
  },
  dayHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 2,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dayName: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dayDate: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyDayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 80,
  },
  emptyDayEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  emptyDayTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  emptyDaySubtitle: {
    fontSize: 15,
  },
  dayCategoriesScroll: {
    flex: 1,
  },
  dayCategoriesContent: {
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 24,
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categorySectionEmoji: {
    fontSize: 22,
  },
  categorySectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  scheduleCard: {
    width: 130,
    alignItems: 'center',
  },
  scheduleCardImageWrap: {
    width: 120,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scheduleCardImage: {
    width: '100%',
    height: '100%',
  },
  scheduleCardPlaceholderEmoji: {
    fontSize: 36,
  },
  scheduleCardName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
  },
});
