import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface VideoHighlightCardProps {
    coverImage?: string; // Can be image URL (if we have a photo fallback)
    videoSource?: string; // Video URL
}

export function VideoHighlightCard({ coverImage, videoSource }: VideoHighlightCardProps) {
    const setupPlayer = (player: any) => {
        player.muted = true;
        player.loop = true;
        if (videoSource) {
            player.play();
        }
    };

    // If we have a video source, setup the player
    const player = useVideoPlayer(videoSource || '', setupPlayer);

    const handlePress = () => {
        router.push('/(tabs)/gallery');
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
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



                <View style={styles.content}>
                    <Text style={styles.title}>Video Özetleri</Text>
                </View>
            </View>
        </TouchableOpacity>
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

    content: {
        position: 'absolute',
        bottom: 24,
        left: 24,
        zIndex: 2,
    },
    title: {
        fontSize: 20,
        color: '#fff',
        fontFamily: Typography.fontFamily.serif,
    },
});
