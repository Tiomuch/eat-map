import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
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
  backButtonContainer: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
  },
})
