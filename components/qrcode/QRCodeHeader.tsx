import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface QRCodeHeaderProps {
    title?: string;
    subtitle?: string;
}

export function QRCodeHeader({
    title = 'QR Kodunuz',
    subtitle = 'Misafirleriniz bu kodu taratarak anılarını paylaşabilir',
}: QRCodeHeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 15,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
});
