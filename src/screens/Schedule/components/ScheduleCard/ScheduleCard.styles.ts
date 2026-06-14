import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
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
})
