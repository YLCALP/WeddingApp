import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { COLUMN_COUNT, MediaGridItem } from './MediaGridItem';

interface MediaItem {
    id: string;
    type: 'photo' | 'video' | 'audio' | 'note';
    publicUrl?: string;
    note_content?: string;
}

interface MediaGridProps {
    media: MediaItem[];
    isLoading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    onItemPress: (item: MediaItem) => void;
}

export function MediaGrid({
    media,
    isLoading,
    refreshing,
    onRefresh,
    onItemPress,
}: MediaGridProps) {
    if (isLoading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <FlatList
            data={media}
            renderItem={({ item }) => (
                <MediaGridItem item={item} onPress={() => onItemPress(item)} />
            )}
            keyExtractor={(item) => item.id}
            numColumns={COLUMN_COUNT}
            contentContainerStyle={styles.gridContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="images-outline" size={64} color={Colors.light.textMuted} />
                    <Text style={styles.emptyText}>Henüz hiç anı paylaşılmamış.</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContent: {
        paddingHorizontal: 2,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.light.textMuted,
    },
});
