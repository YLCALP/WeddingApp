import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Typography } from '../../constants/Typography';
import VideoPlayer from '../VideoPlayer';

const { width } = Dimensions.get('window');

interface MediaItem {
    id: string;
    type: 'photo' | 'video' | 'audio' | 'note';
    publicUrl?: string;
    note_content?: string;
    uploader_name?: string;
}

interface MediaDetailModalProps {
    media: MediaItem | null;
    visible: boolean;
    onClose: () => void;
    onDelete: (id: string) => void;
}

export function MediaDetailModal({
    media,
    visible,
    onClose,
    onDelete,
}: MediaDetailModalProps) {
    if (!media) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <BlurView intensity={90} tint="dark" style={styles.modalContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>

                <View style={styles.modalContent}>
                    {media.type === 'photo' && (
                        <Image
                            source={{ uri: media.publicUrl || 'https://via.placeholder.com/400' }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    )}

                    {media.type === 'video' && (
                        <VideoPlayer uri={media.publicUrl} style={styles.modalVideo} />
                    )}

                    {media.type === 'note' && (
                        <View style={styles.modalNote}>
                            <Ionicons
                                name="chatbox-ellipses"
                                size={48}
                                color="white"
                                style={{ marginBottom: 20 }}
                            />
                            <Text style={styles.modalNoteText}>{media.note_content}</Text>
                            <Text style={styles.modalNoteAuthor}>
                                - {media.uploader_name || 'Misafir'}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.modalFooter}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDelete(media.id)}
                    >
                        <Ionicons name="trash-outline" size={24} color="#ff4444" />
                        <Text style={styles.deleteText}>Sil</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    modalContent: {
        width: width,
        height: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    modalVideo: {
        width: '100%',
        height: '100%',
    },
    modalNote: {
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalNoteText: {
        fontSize: 24,
        color: 'white',
        textAlign: 'center',
        fontFamily: Typography.fontFamily.serif,
    },
    modalNoteAuthor: {
        marginTop: 20,
        fontSize: 24, // Increased size for cursive
        color: '#ddd',
        fontFamily: Typography.fontFamily.cursive,
    },
    modalFooter: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 68, 68, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 8,
    },
    deleteText: {
        color: '#ff4444',
        fontSize: 16,
        fontFamily: Typography.fontFamily.serif,
    },
});
