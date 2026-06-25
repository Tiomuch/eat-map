import { useTheme } from '@/theme/ThemeContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { styles } from './SaveTemplateModal.styles'


interface SaveTemplateModalProps {
  visible: boolean
  onSave: (name: string) => void
  onClose: () => void
}

export default function SaveTemplateModal({ visible, onSave, onClose }: SaveTemplateModalProps) {
  const { colors } = useTheme()
  const [name, setName] = useState('')

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim())
      setName('')
    }
  }

  const handleClose = () => {
    setName('')
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
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.background },
            ]}
            placeholder="e.g., Healthy Weekday"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Pressable
            onPress={handleSave}
            disabled={!name.trim()}
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
