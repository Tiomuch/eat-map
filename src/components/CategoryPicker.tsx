import React from 'react';
import { StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeContext';
import { CATEGORIES, Category } from '@/types/dish';

interface CategoryPickerProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function CategoryChip({
  category,
  isSelected,
  onPress,
}: {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        animatedStyle,
        {
          backgroundColor: isSelected ? colors.primary : colors.categoryChip,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: isSelected ? '#FFFFFF' : colors.categoryChipText,
            fontWeight: isSelected ? '700' : '500',
          },
        ]}
      >
        {category}
      </Text>
    </AnimatedPressable>
  );
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
