import ConfirmModal from '@/components/ConfirmModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import {
  addToSchedule,
  getWeekDates,
  isDishScheduledForDate,
} from '@/db/scheduleRepository';
import { useTheme } from '@/theme/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayChip {
  date: string;
  dayShort: string;
  dayNum: number;
  isToday: boolean;
}

function buildDayChips(): DayChip[] {
  const dates = getWeekDates();
  return dates.map((dateStr, index) => {
    const d = new Date(dateStr + 'T12:00:00');
    return {
      date: dateStr,
      dayShort: DAY_NAMES_SHORT[d.getDay()],
      dayNum: d.getDate(),
      isToday: index === 0,
    };
  });
}

export default function AddToScheduleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    dishId: string;
    dishName: string;
    dishPhoto: string;
    dishCategory: string;
  }>();

  const dishId = Number(params.dishId);
  const dishName = Array.isArray(params.dishName) ? params.dishName[0] : (params.dishName || '');
  const dishPhotoRaw = Array.isArray(params.dishPhoto) ? params.dishPhoto[0] : (params.dishPhoto || '');
  const dishCategory = Array.isArray(params.dishCategory) ? params.dishCategory[0] : (params.dishCategory || '');

  const [dayChips] = useState<DayChip[]>(buildDayChips);
  const [selectedDate, setSelectedDate] = useState<string>(dayChips[0]?.date || '');
  const [saving, setSaving] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAddPress = () => {
    if (!selectedDate || !dishId) return;
    setShowConfirmModal(true);
  };

  const executeAdd = async () => {
    setShowConfirmModal(false);

    setSaving(true);
    try {
      // Check for duplicate
      const alreadyScheduled = await isDishScheduledForDate(dishId, selectedDate);
      if (alreadyScheduled) {
        setSaving(false);
        setShowDuplicateModal(true);
        return;
      }

      await addToSchedule(dishId, selectedDate, dishCategory);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/schedule' as any);
      }
    } catch {
      Alert.alert('Error', 'Failed to add to schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedDayInfo = dayChips.find((c) => c.date === selectedDate);
  const selectedLabel = selectedDayInfo?.isToday
    ? 'Today'
    : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
          <View style={[styles.dishPreview, { backgroundColor: colors.surface }]}>
            <View
              style={[styles.dishPreviewImageWrap, { backgroundColor: colors.surfaceVariant }]}
            >
              {dishPhotoRaw ? (
                <Image
                  source={{ uri: dishPhotoRaw }}
                  style={styles.dishPreviewImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.dishPreviewPlaceholder}>🍽️</Text>
              )}
            </View>
            <View style={styles.dishPreviewInfo}>
              <Text style={[styles.dishPreviewName, { color: colors.text }]} numberOfLines={2}>
                {dishName}
              </Text>
              <View style={[styles.categoryBadge, { backgroundColor: colors.categoryChip }]}>
                <Text style={[styles.categoryBadgeText, { color: colors.categoryChipText }]}>
                  {dishCategory}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Date Picker */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Pick a Day
            </Text>
            <View style={styles.dayChipsContainer}>
              {dayChips.map((chip, index) => {
                const isSelected = chip.date === selectedDate;
                return (
                  <Animated.View
                    key={chip.date}
                    entering={FadeIn.delay(250 + index * 50).duration(300)}
                  >
                    <Pressable
                      onPress={() => setSelectedDate(chip.date)}
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
                        style={[
                          styles.dayChipNum,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {chip.dayNum}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
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
          <MaterialCommunityIcons
            name="calendar-plus"
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>
            {saving ? 'Adding...' : 'Add to Schedule'}
          </Text>
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
          setShowDuplicateModal(false);
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/schedule' as any);
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  dishPreview: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 28,
  },
  dishPreviewImageWrap: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishPreviewImage: {
    width: '100%',
    height: '100%',
  },
  dishPreviewPlaceholder: {
    fontSize: 42,
  },
  dishPreviewInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 10,
  },
  dishPreviewName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  dayChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  dayChip: {
    width: 72,
    height: 80,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayChipDay: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayChipNum: {
    fontSize: 24,
    fontWeight: '800',
  },
  selectedDateLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
  },
  addButtonWrap: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
