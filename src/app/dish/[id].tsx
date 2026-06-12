import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeContext';
import { getDishById, deleteDish } from '@/db/dishRepository';
import { Dish } from '@/types/dish';
import FloatingActionButton from '@/components/FloatingActionButton';
import ConfirmModal from '@/components/ConfirmModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (id) {
        const result = await getDishById(Number(id));
        setDish(result);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (dish) {
      await deleteDish(dish.id);
      setShowDeleteModal(false);
      router.back();
    }
  };

  const handleEdit = () => {
    if (dish) {
      router.push(`/dish/edit/${dish.id}`);
    }
  };

  const handleSchedule = () => {
    if (dish) {
      router.push({
        pathname: '/schedule/add',
        params: {
          dishId: dish.id,
          dishName: dish.name,
          dishPhoto: encodeURIComponent(dish.photoUri || ''),
          dishCategory: dish.category,
        },
      } as any);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!dish) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Dish not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <Animated.View entering={FadeInUp.duration(500)}>
          <View style={styles.heroContainer}>
            {dish.photoUri ? (
              <Image source={{ uri: dish.photoUri }} style={styles.heroImage} contentFit="cover" />
            ) : (
              <View style={[styles.heroPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={{ fontSize: 80 }}>🍽️</Text>
              </View>
            )}
            <View style={styles.heroOverlay} />

            {/* Back button */}
            <Animated.View style={styles.backButton}>
              <FloatingActionButton
                icon="arrow-left"
                color={colors.text}
                backgroundColor={colors.surface + 'DD'}
                onPress={() => router.back()}
                size={44}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            {/* Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: colors.categoryChip }]}>
              <Text style={[styles.categoryBadgeText, { color: colors.categoryChipText }]}>
                {dish.category}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <Text style={[styles.dishName, { color: colors.text }]}>{dish.name}</Text>
          </Animated.View>

          {/* Decorative divider */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={styles.dividerIcon}>✦</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>DESCRIPTION</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {dish.description || 'No description added yet.'}
            </Text>
          </Animated.View>

          {/* Meta info */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <View style={[styles.metaCard, { backgroundColor: colors.surfaceVariant }]}>
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>Added</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {new Date(dish.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons — horizontal row */}
      <View style={styles.fabContainer}>
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <FloatingActionButton
            icon="pencil-outline"
            color="#FFFFFF"
            backgroundColor={colors.info}
            onPress={handleEdit}
            size={52}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(550).duration(400)}>
          <FloatingActionButton
            icon="calendar-clock"
            color="#FFFFFF"
            backgroundColor={colors.warning}
            onPress={handleSchedule}
            size={52}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <FloatingActionButton
            icon="trash-can-outline"
            color="#FFFFFF"
            backgroundColor={colors.danger}
            onPress={() => setShowDeleteModal(true)}
            size={52}
          />
        </Animated.View>
      </View>

      {/* Delete Confirmation */}
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Dish"
        message={`Are you sure you want to delete "${dish.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep it"
        confirmColor={colors.danger}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dishName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerIcon: {
    fontSize: 12,
    color: '#D4AF37',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  description: {
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 24,
  },
  metaCard: {
    borderRadius: 16,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    alignItems: 'center',
  },
});
