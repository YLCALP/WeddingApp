import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export function GuestAccessCard() {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push('/(tabs)/qr-code')}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="qr-code" size={24} color={Colors.light.secondary} />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Misafir Erişim Kodu</Text>
                <Text style={styles.subtitle}>Davet linkini paylaşmak için dokunun</Text>
            </View>

            <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        shadowColor: Colors.light.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.light.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 2,
        fontFamily: Typography.fontFamily.serif,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.surfaceVariant,
        borderRadius: 16,
    },
});
