import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface QRCodeInfoProps {
    qrUrl: string;
    infoText?: string;
}

export function QRCodeInfo({
    qrUrl,
    infoText = 'Bu QR kodu davetiyenize, masalara veya sosyal medyada paylaşabilirsiniz. Misafirleriniz kodu taratarak fotoğraf, video, ses ve notlarını yükleyebilir.',
}: QRCodeInfoProps) {
    const handleLinkPress = () => {
        Linking.openURL(qrUrl);
    };

    return (
        <>
            <TouchableOpacity style={styles.linkContainer} onPress={handleLinkPress}>
                <Ionicons name="link" size={16} color={Colors.light.primary} />
                <Text style={styles.linkText} numberOfLines={1}>
                    {qrUrl}
                </Text>
                <Ionicons name="open-outline" size={16} color={Colors.light.primary} />
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <Ionicons name="information-circle" size={18} color={Colors.light.accent} />
                <Text style={styles.infoText}>{infoText}</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.surfaceVariant,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 20,
        gap: 8,
    },
    linkText: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.mono,
        color: Colors.light.textMuted,
        flex: 1,
        textAlign: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: Colors.light.accent + '10',
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.accent,
        lineHeight: 22,
    },
});
