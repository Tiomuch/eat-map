import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as FileSystem from 'expo-file-system/legacy'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTheme } from '@/theme/ThemeContext'
import { getDishById, updateDish } from '@/db/dishRepository'
import { CATEGORIES, Category, Dish } from '@/types/dish'
import ImagePickerField from '@/components/ImagePickerField/ImagePickerField'
import CategoryPicker from '@/components/CategoryPicker/CategoryPicker'
import FloatingActionButton from '@/components/FloatingActionButton/FloatingActionButton'
import { styles } from './EditDishScreen.styles'

export default function EditDishScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors } = useTheme()
  const [dish, setDish] = useState<Dish | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      if (id) {
        const result = await getDishById(Number(id))
        if (result) {
          setDish(result)
          setName(result.name)
          setDescription(result.description)
          setCategory(result.category)
          setImageUri(result.photoUri)
        }
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a dish name.')
      return
    }

    if (!dish) return

    setSaving(true)
    try {
      let finalPhotoUri = imageUri

      // Copy new image to document directory if it's from picker
      if (
        imageUri &&
        imageUri !== dish.photoUri &&
        !imageUri.startsWith(FileSystem.documentDirectory || '')
      ) {
        const fileName = `dish_${Date.now()}.jpg`
        const destUri = `${FileSystem.documentDirectory}${fileName}`
        await FileSystem.copyAsync({ from: imageUri, to: destUri })
        finalPhotoUri = destUri
      }

      await updateDish(dish.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        photoUri: finalPhotoUri,
      })

      router.back()
    } catch (e) {
      Alert.alert('Error', 'Failed to update dish. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!dish) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Dish not found</Text>
      </View>
    )
  }

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
              <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Dish</Text>
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
  )
}
