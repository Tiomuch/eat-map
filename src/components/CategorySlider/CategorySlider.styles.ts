import { Dimensions, StyleSheet } from 'react-native'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export const styles = StyleSheet.create({
  categoryPage: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 100,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  categoryEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dishCount: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 14,
  },
})
