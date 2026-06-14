import { useTheme } from '@/theme/ThemeContext'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { styles } from './ConfirmModal.styles'

interface ConfirmModalProps {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmColor,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { colors } = useTheme()
  const finalConfirmColor = confirmColor || colors.danger

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.backdrop]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modal, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.iconContainer, { backgroundColor: finalConfirmColor + '15' }]}>
            <Text style={styles.iconEmoji}>⚠️</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onCancel}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>{cancelText}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={[styles.button, styles.confirmButton, { backgroundColor: finalConfirmColor }]}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>{confirmText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
