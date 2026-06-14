import React from 'react'
import { ScrollView } from 'react-native'
import { CATEGORIES, Category } from '@/types/dish'
import CategoryChip from '@/components/CategoryChip/CategoryChip'
import { styles } from './CategoryPicker.styles'

interface CategoryPickerProps {
  selected: Category
  onSelect: (category: Category) => void
}

export default function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isSelected={selected === category}
          onPress={() => onSelect(category)}
        />
      ))}
    </ScrollView>
  )
}
