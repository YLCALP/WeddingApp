
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function SuccessScreen() {
    const router = useRouter();

    const handleHome = () => {
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-circle" size={100} color={Colors.light.success} />
                </View>

                <Text style={styles.title}>Ödeme Başarılı!</Text>
                <Text style={styles.message}>
                    Siparişiniz başarıyla alındı. Etkinliğiniz artık aktif ve özelliklere tam erişim sağlayabilirsiniz.
                </Text>

                <TouchableOpacity style={styles.homeButton} onPress={handleHome}>
                    <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
                    <Ionicons name="home-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    iconContainer: {
        marginBottom: 32,
        shadowColor: Colors.light.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 48,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    homeButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        justifyContent: 'center',
    },
    homeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Typography.fontFamily.serif,
    },
});
