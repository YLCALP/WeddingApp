import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface GalleryPreviewCardProps {
    totalMedia: number;
    coverImage?: string;
}

export function GalleryPreviewCard({ totalMedia, coverImage }: GalleryPreviewCardProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push('/(tabs)/gallery')}
            activeOpacity={0.9}
        >
            {coverImage ? (
                <Image
                    source={{ uri: coverImage }}
                    style={styles.backgroundImage}
                    contentFit="cover" // Ensures the image fills the container, cropping if necessary
                    transition={200}
                />
            ) : (
                <View style={[styles.backgroundImage, { backgroundColor: Colors.light.accent }]} />
            )}

            <View style={styles.overlay} />

            <View style={styles.iconContainer}>
                <Ionicons name="images" size={20} color="#fff" />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Tüm Galeri</Text>
                <Text style={styles.subtitle}>Tüm {totalMedia} anıyı görüntüle</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.surfaceVariant,
        borderRadius: 24,
        height: 180,
        marginBottom: 16,
        overflow: 'hidden',
        position: 'relative',
        padding: 24,
        justifyContent: 'flex-end',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24, // Match container border radius to prevent bleeding on some Android versions
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 24,
    },
    iconContainer: {
        position: 'absolute',
        top: 24,
        left: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    content: {
        zIndex: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
});
