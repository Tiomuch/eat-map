import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120, // space for bottom buttons
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
  addButtonWrapper: {
    width: 130,
    alignItems: 'center',
  },
  addButton: {
    width: 120,
    height: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  bottomBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  bottomBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
