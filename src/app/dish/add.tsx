import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeContext';
import { createDish } from '@/db/dishRepository';
import { CATEGORIES, Category } from '@/types/dish';
import ImagePickerField from '@/components/ImagePickerField';
import CategoryPicker from '@/components/CategoryPicker';
import FloatingActionButton from '@/components/FloatingActionButton';

export default function AddDishScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a dish name.');
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUri = imageUri;

      // Copy image to document directory for persistence
      if (imageUri && !imageUri.startsWith(FileSystem.documentDirectory || '')) {
        const fileName = `dish_${Date.now()}.jpg`;
        const destUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: imageUri, to: destUri });
        finalPhotoUri = destUri;
      }

      await createDish({
        name: name.trim(),
        description: description.trim(),
        category,
        photoUri: finalPhotoUri,
      });

      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save dish. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(50).duration(300)}>
            <View style={styles.header}>
              <FloatingActionButton
                icon="arrow-left"
                color={colors.text}
                backgroundColor={colors.surfaceVariant}
                onPress={() => router.back()}
                size={44}
              />
              <Text style={[styles.headerTitle, { color: colors.text }]}>New Dish</Text>
              <View style={{ width: 44 }} />
            </View>
          </Animated.View>

          {/* Image Picker */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)}>
            <View style={styles.section}>
              <ImagePickerField imageUri={imageUri} onImageSelected={setImageUri} />
            </View>
          </Animated.View>

          {/* Name Input */}
          <Animated.View entering={FadeInDown.delay(150).duration(300)}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="What's the dish called?"
                placeholderTextColor={colors.textTertiary}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceVariant,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>
          </Animated.View>

          {/* Description Input */}
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the dish, ingredients, taste..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.surfaceVariant,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>
          </Animated.View>

          {/* Category Picker */}
          <Animated.View entering={FadeInDown.delay(250).duration(300)}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <CategoryPicker selected={category} onSelect={setCategory} />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Save Button */}
      <View style={styles.saveFabContainer}>
        <FloatingActionButton
          icon={saving ? 'loading' : 'check'}
          color="#FFFFFF"
          backgroundColor={colors.success}
          onPress={handleSave}
          size={60}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  saveFabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 20,
  },
});
