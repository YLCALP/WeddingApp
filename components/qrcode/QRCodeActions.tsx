import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface QRCodeActionsProps {
    onShare: () => void;
    onCopyLink: () => void;
}

export function QRCodeActions({ onShare, onCopyLink }: QRCodeActionsProps) {
    return (
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                <Ionicons name="share-outline" size={24} color={Colors.light.primary} />
                <Text style={styles.actionText}>Paylaş</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={onCopyLink}>
                <Ionicons name="copy-outline" size={24} color={Colors.light.primary} />
                <Text style={styles.actionText}>Linki Kopyala</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 20,
    },
    actionButton: {
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 14,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        minWidth: 110,
    },
    actionText: {
        marginTop: 6,
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serifRegular,
    },
});
