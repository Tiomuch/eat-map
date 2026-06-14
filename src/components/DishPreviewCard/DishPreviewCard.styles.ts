import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
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
})
