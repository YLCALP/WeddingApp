import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export function QuickActions() {
    return (
        <>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/(tabs)/qr-code')}
                >
                    <Ionicons name="qr-code" size={28} color={Colors.light.primary} />
                    <Text style={styles.actionText}>QR Kodu Paylaş</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/(tabs)/gallery')}
                >
                    <Ionicons name="images" size={28} color={Colors.light.secondary} />
                    <Text style={styles.actionText}>Galeriyi Gör</Text>
                </TouchableOpacity>
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
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.text,
        marginTop: 8,
    },
});
