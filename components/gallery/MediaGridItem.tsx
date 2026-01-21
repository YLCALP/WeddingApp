import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = width / COLUMN_COUNT - 4;

interface MediaItem {
    id: string;
    type: 'photo' | 'video' | 'audio' | 'note';
    publicUrl?: string;
    note_content?: string;
}

interface MediaGridItemProps {
    item: MediaItem;
    onPress: () => void;
}

export function MediaGridItem({ item, onPress }: MediaGridItemProps) {
    if (item.type === 'photo') {
        return (
            <TouchableOpacity style={styles.mediaItem} onPress={onPress}>
                <Image
                    source={{ uri: item.publicUrl || 'https://via.placeholder.com/150' }}
                    style={styles.thumbnail}
                />
            </TouchableOpacity>
        );
    }

    if (item.type === 'video') {
        return (
            <TouchableOpacity style={styles.mediaItem} onPress={onPress}>
                <View style={styles.videoPlaceholder}>
                    <Ionicons name="play-circle" size={32} color="white" />
                </View>
            </TouchableOpacity>
        );
    }

    if (item.type === 'note') {
        return (
            <TouchableOpacity style={[styles.mediaItem, styles.noteItem]} onPress={onPress}>
                <Ionicons name="text" size={24} color={Colors.light.primary} />
                <Text style={styles.notePreview} numberOfLines={3}>
                    {item.note_content}
                </Text>
            </TouchableOpacity>
        );
    }

    return null;
}

export { COLUMN_COUNT, ITEM_SIZE };

const styles = StyleSheet.create({
    mediaItem: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        margin: 2,
        backgroundColor: Colors.light.surfaceVariant,
        borderRadius: 8,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    noteItem: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF8E1',
    },
    notePreview: {
        fontSize: 12,
        color: Colors.light.text,
        textAlign: 'center',
        marginTop: 4,
    },
});
