import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { DashboardHeader } from './DashboardHeader';
import { EventCard } from './EventCard';
import { OrderDetailsCard } from './OrderDetailsCard';

interface Event {
    id: string;
    event_type: 'wedding' | 'engagement';
    partner1_name: string;
    partner2_name: string;
    event_date?: string;
    venue?: string;
}

interface PurchaseItem {
    id: string;
    quantity: number;
    unit_price_cents: number;
    customization_text?: string;
    products?: {
        name: string;
    };
}

interface Purchase {
    package_id: string;
    total_amount_cents: number;
    packages?: {
        name: string;
    };
}

interface Profile {
    full_name?: string;
}

interface PendingPaymentViewProps {
    event: Event;
    purchase: Purchase | null;
    purchaseItems: PurchaseItem[];
    profile: Profile | null;
    onRefresh: () => void;
    refreshing: boolean;
}

export function PendingPaymentView({
    event,
    purchase,
    purchaseItems,
    profile,
    onRefresh,
    refreshing,
}: PendingPaymentViewProps) {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[Colors.light.primary]}
                    tintColor={Colors.light.primary}
                />
            }
        >
            <DashboardHeader
                userName={profile?.full_name || 'Kullanıcı'}
                showNotification={false}
            />

            <View style={styles.pendingCard}>
                <View style={styles.pendingIconContainer}>
                    <Ionicons name="time-outline" size={48} color={Colors.light.warning} />
                </View>
                <Text style={styles.pendingTitle}>
                    {purchase ? 'Ödeme Bekleniyor' : 'Paket Seçimi Bekliyor'}
                </Text>
                <Text style={styles.pendingText}>
                    {purchase
                        ? 'Siparişiniz oluşturuldu ancak ödeme henüz tamamlanmadı. Özelliklere erişmek için ödemenizi tamamlayın.'
                        : 'Davetiniz oluşturuldu. Özelliklere erişmek için bir paket seçmeniz gerekiyor.'}
                </Text>
            </View>

            <EventCard event={event} onEditPress={() => router.push('/edit-event')} />

            {purchase && (
                <OrderDetailsCard purchase={purchase} purchaseItems={purchaseItems} />
            )}

            <TouchableOpacity
                style={styles.payButton}
                onPress={() => {
                    if (purchase) {
                        router.push({
                            pathname: '/(onboarding)/add-products',
                            params: {
                                eventId: event.id,
                                packageId: purchase.package_id,
                            },
                        });
                    } else {
                        router.push({
                            pathname: '/(onboarding)/select-package',
                            params: { eventId: event.id },
                        });
                    }
                }}
            >
                <Ionicons
                    name={purchase ? 'card-outline' : 'gift-outline'}
                    size={20}
                    color="#fff"
                />
                <Text style={styles.payButtonText}>
                    {purchase ? 'Ödemeyi Tamamla' : 'Paket Seç'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 100,
    },
    pendingCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.light.warning + '40',
    },
    pendingIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.light.warning + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    pendingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    pendingText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    payButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
