import FloatingActionButton from '@/components/FloatingActionButton/FloatingActionButton'
import TemplateCard from '@/components/TemplateCard/TemplateCard'
import { deleteTemplate, getTemplates } from '@/db/templateRepository/templateRepository'
import { useTheme } from '@/theme/ThemeContext'
import { Template } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { FlatList, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { styles } from './TemplatesScreen.styles'


export default function TemplatesScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const loadTemplates = useCallback(async () => {
    const data = await getTemplates()
    setTemplates(data)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadTemplates()
    }, [loadTemplates]),
  )

  const handleDelete = async (id: number) => {
    await deleteTemplate(id)
    await loadTemplates()
  }

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInDown.delay(50).duration(300)}>
        <View style={styles.header}>
          <FloatingActionButton
            icon="arrow-left"
            color={colors.text}
            backgroundColor={colors.surfaceVariant}
            onPress={() => router.back()}
            size={44}
          />
          <Text style={[styles.title, { color: colors.text }]}>Templates</Text>
          <FloatingActionButton
            icon="plus"
            color="#fff"
            backgroundColor={colors.success}
            onPress={() => router.push('/create-template')}
            size={44}
          />
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="magnify" size={24} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search templates..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </Animated.View>

      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TemplateCard
            template={item}
            onPress={() => router.push(`/edit-template?id=${item.id}` as any)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery ? 'No templates found matching your search.' : "You don't have any templates yet."}
            </Text>
          </View>
        }
      />
    </View>
  )
}
