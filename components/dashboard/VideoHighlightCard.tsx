import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface VideoHighlightCardProps {
    coverImage?: string; // Can be image URL (if we have a photo fallback)
    videoSource?: string; // Video URL
}

export function VideoHighlightCard({ coverImage, videoSource }: VideoHighlightCardProps) {
    // If we have a video source, setup the player
    const player = useVideoPlayer(videoSource || '', (player) => {
        player.muted = true;
        player.loop = true;
        // Auto-play if we want it to be alive, or just pause for thumb.
        // User asked for "cover image", so maybe just paused at 0?
        // But a moving video is cooler and "highlight"y. Let's try playing silently.
        if (videoSource) {
            player.play();
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.thumbnailPlaceholder}>
                {videoSource ? (
                    <VideoView
                        player={player}
                        style={styles.backgroundImage}
                        contentFit="cover"
                        nativeControls={false}
                    />
                ) : coverImage ? (
                    <Image source={{ uri: coverImage }} style={styles.backgroundImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.backgroundImage, { backgroundColor: '#333' }]} />
                )}

                <View style={styles.overlay} />

                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => router.push('/(tabs)/gallery')}
                >
                    <Ionicons name="play" size={32} color={Colors.light.primary} />
                </TouchableOpacity>

                <View style={styles.content}>
                    <Text style={styles.title}>Video Özetleri</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        height: 220,
        backgroundColor: Colors.light.surfaceVariant,
    },
    thumbnailPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    content: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        zIndex: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
});
