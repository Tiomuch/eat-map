import { useTheme } from '@/theme/ThemeContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, runOnJS } from 'react-native-reanimated'
import { styles } from './SaveTemplateModal.styles'

import { isTemplateNameUnique } from '@/db/templateRepository/templateRepository'

interface SaveTemplateModalProps {
  visible: boolean
  onSave: (name: string) => void
  onClose: () => void
}

export default function SaveTemplateModal({ visible, onSave, onClose }: SaveTemplateModalProps) {
  const { colors } = useTheme()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Template name cannot be empty')
      return
    }

    setIsSaving(true)
    const isUnique = await isTemplateNameUnique(trimmed)
    setIsSaving(false)

    if (!isUnique) {
      setError('A template with this name already exists')
      return
    }

    onSave(trimmed)
    setName('')
    setError(null)
  }

  const handleClose = () => {
    setName('')
    setError(null)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.backdrop]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modal, { backgroundColor: colors.surface }]}
        >
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Save Template</Text>
              <Pressable onPress={handleClose} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Give a name to your new template.
            </Text>

            <TextInput
              style={[
                styles.input,
                { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: error ? colors.danger : colors.border },
              ]}
              placeholder="e.g. Weekday Breakfasts"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={(text) => {
                setName(text)
                if (error) setError(null)
              }}
              autoFocus
            />
            {error ? (
              <Text style={[styles.errorText, { color: colors.danger, marginTop: -8, marginBottom: 16, marginLeft: 4 }]}>
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={handleSave}
              disabled={isSaving || !name.trim()}
              style={[
                styles.saveBtn,
                { backgroundColor: name.trim() ? colors.primary : colors.surfaceVariant },
              ]}
            >
              <Text style={[styles.saveBtnText, { color: name.trim() ? '#fff' : colors.textTertiary }]}>
                Save Template
              </Text>
            </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}
