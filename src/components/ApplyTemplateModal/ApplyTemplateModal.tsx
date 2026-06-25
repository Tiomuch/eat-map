import { useTheme } from '@/theme/ThemeContext'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View, FlatList } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, runOnJS } from 'react-native-reanimated'
import { styles } from './ApplyTemplateModal.styles'

import { getTemplates } from '@/db/templateRepository/templateRepository'
import { Template } from '@/types/dish'

interface ApplyTemplateModalProps {
  visible: boolean
  onApply: (templateId: number) => void
  onClose: () => void
}

export default function ApplyTemplateModal({ visible, onApply, onClose }: ApplyTemplateModalProps) {
  const { colors } = useTheme()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    if (visible) {
      loadTemplates()
      setSelectedId(null)
    }
  }, [visible])

  const loadTemplates = async () => {
    const data = await getTemplates()
    setTemplates(data)
  }

  const handleApply = () => {
    if (selectedId !== null) {
      onApply(selectedId)
    }
  }

  const renderItem = ({ item }: { item: Template }) => {
    const isSelected = item.id === selectedId
    return (
      <Pressable
        style={[
          styles.templateItem,
          { backgroundColor: isSelected ? colors.primary + '20' : colors.surfaceVariant },
          isSelected && { borderColor: colors.primary, borderWidth: 1 }
        ]}
        onPress={() => setSelectedId(item.id)}
      >
        <Text style={[styles.templateName, { color: colors.text }]}>{item.name}</Text>
        {isSelected && (
          <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
        )}
      </Pressable>
    )
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.backdrop]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(300).springify()}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modal, { backgroundColor: colors.surface }]}
        >
            <Text style={[styles.title, { color: colors.text }]}>Apply Template</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Select a template to apply.
            </Text>

            <FlatList
              data={templates}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              style={[styles.list, { minHeight: 150 }]}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No templates found.</Text>
              }
            />

            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </Pressable>

              <Pressable
                onPress={handleApply}
                disabled={selectedId === null}
                style={[
                  styles.button,
                  styles.applyButton,
                  { backgroundColor: selectedId !== null ? colors.primary : colors.surfaceVariant },
                ]}
              >
                <MaterialCommunityIcons name="check" size={24} color={selectedId !== null ? '#fff' : colors.textTertiary} />
              </Pressable>
            </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
