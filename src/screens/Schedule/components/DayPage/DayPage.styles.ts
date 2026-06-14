import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
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
})
