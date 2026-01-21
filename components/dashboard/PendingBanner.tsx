import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

interface PendingBannerProps {
    purchaseId: string;
}

export function PendingBanner({ purchaseId }: PendingBannerProps) {
    return (
        <TouchableOpacity
            style={styles.pendingBanner}
            onPress={() =>
                router.push({
                    pathname: '/checkout/summary',
                    params: { purchaseId },
                })
            }
        >
            <View style={styles.pendingBannerContent}>
                <Ionicons name="time" size={20} color={Colors.light.warning} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.pendingBannerTitle}>Ödemesi Bekleyen Sipariş</Text>
                    <Text style={styles.pendingBannerText}>
                        Siparişinizi tamamlamak için tıklayın
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    pendingBanner: {
        backgroundColor: Colors.light.warning + '15',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.light.warning + '30',
    },
    pendingBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    pendingBannerTitle: {
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serif,
    },
    pendingBannerText: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        fontFamily: Typography.fontFamily.serifRegular,
    },
});
