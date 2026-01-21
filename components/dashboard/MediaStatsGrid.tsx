import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface MediaStatsGridProps {
    stats: {
        photos: number;
        videos: number;
        audios: number;
        notes: number;
    };
}

export function MediaStatsGrid({ stats }: MediaStatsGridProps) {
    const statItems = [
        {
            type: 'photo',
            value: stats.photos,
            label: 'Fotoğraf',
            icon: 'image',
            iconColor: '#FF6B6B',
            bgColor: '#FFE4E1',
        },
        {
            type: 'video',
            value: stats.videos,
            label: 'Video',
            icon: 'videocam',
            iconColor: '#4A90D9',
            bgColor: '#E8F4FD',
        },
        {
            type: 'audio',
            value: stats.audios,
            label: 'Ses Kaydı',
            icon: 'mic',
            iconColor: '#9B59B6',
            bgColor: '#F0E8FF',
        },
        {
            type: 'note',
            value: stats.notes,
            label: 'Not',
            icon: 'document-text',
            iconColor: '#F5A623',
            bgColor: '#FFF8E1',
        },
    ];

    return (
        <>
            <Text style={styles.sectionTitle}>Anılarınız</Text>
            <View style={styles.statsGrid}>
                {statItems.map((item) => (
                    <TouchableOpacity
                        key={item.type}
                        style={styles.statCard}
                        onPress={() => router.push({ pathname: '/(tabs)/gallery', params: { type: item.type } })}
                    >
                        <View style={[styles.statIcon, { backgroundColor: item.bgColor }]}>
                            <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
                        </View>
                        <Text style={styles.statValue}>{item.value}</Text>
                        <Text style={styles.statLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 52) / 2,
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text,
    },
    statLabel: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        marginTop: 4,
    },
});
