import { useTheme } from '@/theme/ThemeContext'
import { ScheduleItem } from '@/types/dish'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'
import { styles } from './ScheduleCard.styles'

interface ScheduleCardProps {
  item: ScheduleItem
  onRemove: (item: ScheduleItem) => void
}

export function ScheduleCard({ item, onRemove }: ScheduleCardProps) {
  const { colors } = useTheme()

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.springify()}
      style={styles.scheduleCard}
    >
      <View style={[styles.scheduleCardImageWrap, { backgroundColor: colors.surfaceVariant }]}>
        {item.dishPhotoUri ? (
          <Image
            source={{ uri: item.dishPhotoUri }}
            style={styles.scheduleCardImage}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.scheduleCardPlaceholderEmoji}>🍽️</Text>
        )}
        {/* Red X remove button */}
        <Pressable onPress={() => onRemove(item)} style={styles.removeButton} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
      <Text style={[styles.scheduleCardName, { color: colors.text }]} numberOfLines={2}>
        {item.dishName}
      </Text>
    </Animated.View>
  )
}

export default ScheduleCard
