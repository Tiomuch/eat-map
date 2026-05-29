import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Pressable,
  FlatList,
  ViewToken,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { getDishesByCategory } from '@/db/dishRepository';
import { CATEGORIES, Category, Dish } from '@/types/dish';
import DishCard from '@/components/DishCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.45;

interface CategorySliderProps {
  category: Category;
  dishes: Dish[];
  onDishPress: (dish: Dish) => void;
  onAddPress: () => void;
}

function CategorySlider({ category, dishes, onDishPress, onAddPress }: CategorySliderProps) {
  const { colors } = useTheme();
  const carouselRef = useRef<ICarouselInstance>(null);
  const randomScale = useSharedValue(1);

  const getCategoryEmoji = (cat: Category): string => {
    const emojis: Record<Category, string> = {
      Breakfast: '🌅',
      Soup: '🍲',
      'Main Course': '🥩',
      Salad: '🥗',
      Dessert: '🍰',
      Drink: '🥤',
    };
    return emojis[cat];
  };

  const handleRandom = () => {
    if (dishes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * dishes.length);

    // Animate button press
    randomScale.value = withSequence(
      withSpring(0.85, { damping: 8, stiffness: 400 }),
      withSpring(1.1, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 }),
    );

    // Scroll carousel to random dish with animation
    carouselRef.current?.scrollTo({
      index: randomIndex,
      animated: true,
    });
  };

  const randomButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: randomScale.value }],
  }));

  const animationStyle = useCallback(
    (value: number) => {
      'worklet';

      // Calculate exact offset for a 20px gap
      const GAP = 20;
      const offset = CARD_WIDTH * 0.925 + GAP;
      const translateX = interpolate(value, [-1, 0, 1], [-offset, 0, offset]);
      const scale = interpolate(value, [-1, 0, 1], [0.85, 1, 0.85]);
      const opacity = interpolate(value, [-1, 0, 1], [0.5, 1, 0.5]); 

      return {
        transform: [
          { translateX },
          { scale }
        ],
        opacity,
        zIndex: interpolate(value, [-1, 0, 1], [0, 10, 0]),
      };
    },
    [],
  );

  if (dishes.length === 0) {
    return (
      <View style={[styles.categoryPage, { height: SCREEN_HEIGHT }]}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(category)}</Text>
          <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>🍽️</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No dishes yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Tap + to add your first {category.toLowerCase()} dish
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            onPress={onAddPress}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Dish</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.categoryPage, { height: SCREEN_HEIGHT }]}>
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.categoryHeader}
      >
        <Text style={styles.categoryEmoji}>{getCategoryEmoji(category)}</Text>
        <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
        <Text style={[styles.dishCount, { color: colors.textTertiary }]}>
          {dishes.length} {dishes.length === 1 ? 'dish' : 'dishes'}
        </Text>
      </Animated.View>

      <View style={styles.carouselContainer}>
        <Carousel
          ref={carouselRef}
          loop
          width={SCREEN_WIDTH}
          height={CARD_HEIGHT}
          data={dishes}
          customAnimation={animationStyle}
          scrollAnimationDuration={600}
          renderItem={({ item, index }) => (
            <View 
              style={[styles.cardWrapper, { paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 }]} 
              key={`${item.id}-${index}`}
            >
              <DishCard
                dish={item}
                onPress={() => onDishPress(item)}
              />
            </View>
          )}
        />
      </View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.buttonRow}
      >
        <Animated.View style={randomButtonStyle}>
          <Pressable
            onPress={handleRandom}
            style={[styles.randomButton, { backgroundColor: colors.primary }]}
          >
            <MaterialCommunityIcons name="dice-multiple-outline" size={22} color="#FFFFFF" />
            <Text style={styles.randomButtonText}>Random</Text>
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={onAddPress}
          style={[styles.plusButton, { backgroundColor: colors.success }]}
        >
          <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function MainScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [dishesByCategory, setDishesByCategory] = useState<Record<Category, Dish[]>>(
    {} as Record<Category, Dish[]>,
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadDishes = useCallback(async () => {
    const result: Record<string, Dish[]> = {};
    for (const category of CATEGORIES) {
      result[category] = await getDishesByCategory(category);
    }
    setDishesByCategory(result as Record<Category, Dish[]>);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDishes();
    }, [loadDishes]),
  );

  const handleDishPress = (dish: Dish) => {
    router.push(`/dish/${dish.id}`);
  };

  const handleAddPress = () => {
    router.push('/dish/add');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={({ item: category }) => (
          <CategorySlider
            category={category}
            dishes={dishesByCategory[category] || []}
            onDishPress={handleDishPress}
            onAddPress={handleAddPress}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {/* Category indicator dots */}
      <View style={[styles.dotsContainer, { backgroundColor: colors.surface + 'CC' }]}>
        {CATEGORIES.map((cat, index) => (
          <View
            key={cat}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex ? colors.primary : colors.border,
                width: index === currentIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryPage: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  randomButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 10,
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
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
  dotsContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -60 }],
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
