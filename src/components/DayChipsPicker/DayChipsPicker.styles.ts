import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
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
})
