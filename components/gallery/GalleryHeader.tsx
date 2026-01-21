import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

type MediaType = 'all' | 'photo' | 'video' | 'audio' | 'note';

interface GalleryHeaderProps {
    mediaCount: number;
    activeType: MediaType;
    onFilterChange: (type: MediaType) => void;
}

const filterOptions: { type: MediaType; label: string; icon: string }[] = [
    { type: 'all', label: 'Tümü', icon: 'grid' },
    { type: 'photo', label: 'Foto', icon: 'image' },
    { type: 'video', label: 'Video', icon: 'videocam' },
    { type: 'note', label: 'Not', icon: 'document-text' },
];

export function GalleryHeader({ mediaCount, activeType, onFilterChange }: GalleryHeaderProps) {
    const renderFilterTab = (type: MediaType, label: string, icon: string) => (
        <TouchableOpacity
            key={type}
            style={[styles.filterTab, activeType === type && styles.activeFilterTab]}
            onPress={() => onFilterChange(type)}
        >
            <Ionicons
                name={icon as any}
                size={18}
                color={activeType === type ? 'white' : Colors.light.textSecondary}
            />
            <Text style={[styles.filterText, activeType === type && styles.activeFilterText]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.header}>
            <Text style={styles.title}>Anılar</Text>
            <Text style={styles.subtitle}>{mediaCount} içerik paylaşıldı</Text>

            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={filterOptions}
                    keyExtractor={(item) => item.type}
                    renderItem={({ item }) => renderFilterTab(item.type, item.label, item.icon)}
                    contentContainerStyle={styles.filterList}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textSecondary,
        marginBottom: 16,
    },
    filterContainer: {
        marginBottom: 8,
    },
    filterList: {
        gap: 12,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.light.surface,
        borderWidth: 1,
        borderColor: Colors.light.border,
        gap: 6,
    },
    activeFilterTab: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    filterText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        fontFamily: Typography.fontFamily.serifRegular,
        fontWeight: '500',
    },
    activeFilterText: {
        color: 'white',
    },
});
