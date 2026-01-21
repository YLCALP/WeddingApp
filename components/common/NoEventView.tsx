import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface NoEventViewProps {
    title?: string;
    message?: string;
    buttonText?: string;
    onButtonPress?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
}

export function NoEventView({
    title = 'Henüz Davetiniz Yok',
    message = 'Düğün veya nişan davetinizi oluşturun ve anılarınızı toplamaya başlayın.',
    buttonText = 'Davet Oluştur',
    onButtonPress,
    icon = 'heart-outline',
}: NoEventViewProps) {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={80} color={Colors.light.primaryLight} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {onButtonPress && buttonText && (
                <TouchableOpacity style={styles.button} onPress={onButtonPress}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: Colors.light.background,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        marginTop: 24,
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
