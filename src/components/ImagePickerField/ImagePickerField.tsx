import React from 'react'
import { View, Text, Pressable, ActionSheetIOS, Platform, Alert } from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useTheme } from '@/theme/ThemeContext'
import { styles } from './ImagePickerField.styles'

interface ImagePickerFieldProps {
  imageUri: string | null
  onImageSelected: (uri: string) => void
}

export default function ImagePickerField({ imageUri, onImageSelected }: ImagePickerFieldProps) {
  const { colors } = useTheme()

  const pickImage = async (source: 'camera' | 'library') => {
    let result: ImagePicker.ImagePickerResult

    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.')
        return
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos.')
        return
      }
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })
    }

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri)
    }
  }

  const showPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage('camera')
          else if (buttonIndex === 2) pickImage('library')
        },
      )
    } else {
      Alert.alert('Add Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => pickImage('library') },
      ])
    }
  }

  return (
    <Pressable onPress={showPicker}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border,
          },
        ]}
      >
        {imageUri ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.imageWrapper}>
            <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
            <View style={styles.changeOverlay}>
              <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#FFFFFF" />
              <Text style={styles.changeText}>Change Photo</Text>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.placeholder}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="camera-plus-outline" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.placeholderTitle, { color: colors.text }]}>Add Photo</Text>
            <Text style={[styles.placeholderSubtitle, { color: colors.textTertiary }]}>
              Tap to take or choose a photo
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}
