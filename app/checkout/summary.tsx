import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmModal, Toast, useConfirmModal, useToast } from '../../components/common';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useAuthStore, useEventStore } from '../../store';

export default function OrderSummaryScreen() {
    const router = useRouter();
    const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();
    const { user } = useAuthStore();
    const { fetchEvent } = useEventStore();
    const toast = useToast();
    const confirmModal = useConfirmModal();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [purchase, setPurchase] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        if (purchaseId) {
            fetchPurchaseDetails();
        }
    }, [purchaseId]);

    const fetchPurchaseDetails = async () => {
        try {
            setLoading(true);

            // Fetch Purchase + Package
            const { data: purchaseData, error: purchaseError } = await supabase
                .from('purchases')
                .select(`
                    *,
                    packages (name, price_cents, storage_limit_bytes)
                `)
                .eq('id', purchaseId)
                .single();

            if (purchaseError) throw purchaseError;
            setPurchase(purchaseData);

            // Fetch Items
            const { data: itemsData, error: itemsError } = await supabase
                .from('purchase_items')
                .select(`
                    *,
                    products (name, image_url)
                `)
                .eq('purchase_id', purchaseId);

            if (itemsError) throw itemsError;
            setItems(itemsData || []);

        } catch (error) {
            console.error('Error fetching summary:', error);
            toast.show('Sipariş detayları yüklenemedi.', 'error');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = () => {
        confirmModal.show({
            title: 'Siparişi İptal Et',
            message: 'Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            confirmText: 'Siliyorum, Eminim',
            cancelText: 'Vazgeç',
            confirmStyle: 'destructive',
            onConfirm: async () => {
                try {
                    setSubmitting(true);
                    const { error } = await supabase
                        .from('purchases')
                        .delete()
                        .eq('id', purchaseId);

                    if (error) throw error;

                    if (user?.id) {
                        await fetchEvent(user.id);
                    }

                    toast.show('Sipariş iptal edildi.', 'success');
                    router.dismissAll();
                    router.replace('/(tabs)');

                } catch (error) {
                    console.error('Cancel error:', error);
                    toast.show('Sipariş silinemedi.', 'error');
                } finally {
                    setSubmitting(false);
                }
            },
        });
    };

    const handleContinue = () => {
        router.push({
            pathname: '/checkout/address',
            params: { purchaseId }
        });
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(cents / 100);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    if (!purchase) return null;

    // Calculate subtotal from items
    const itemsTotal = items.reduce((sum, item) => sum + (item.unit_price_cents * item.quantity), 0);
    const packagePrice = purchase.packages?.price_cents || 0;

    // Total checks
    const finalTotal = purchase.total_amount_cents;

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Sipariş Özeti</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.warningCard}>
                    <Ionicons name="information-circle" size={24} color={Colors.light.warning} />
                    <Text style={styles.warningText}>
                        Ödemesi tamamlanmamış bir siparişiniz var. Devam etmek için aşağıdan onaylayın veya siparişi iptal edin.
                    </Text>
                </View>

                {/* Package Info */}
                {purchase.packages && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Seçilen Paket</Text>
                        <View style={styles.itemCard}>
                            <View style={styles.itemIcon}>
                                <Ionicons name="gift-outline" size={24} color={Colors.light.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{purchase.packages.name}</Text>
                                <Text style={styles.itemSub}>Başlangıç Paketi</Text>
                            </View>
                            <Text style={styles.itemPrice}>{formatCurrency(purchase.packages.price_cents)}</Text>
                        </View>
                    </View>
                )}

                {/* Items Info */}
                {items.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ekstra Hizmetler</Text>
                        {items.map((item) => (
                            <View key={item.id} style={styles.itemCard}>
                                <View style={[styles.itemIcon, { backgroundColor: Colors.light.secondary + '20' }]}>
                                    <Ionicons name="cube-outline" size={24} color={Colors.light.secondary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.products?.name || item.product_name_snapshot}</Text>
                                    <Text style={styles.itemSub}>{item.quantity} adet</Text>
                                    {item.customization_text && (
                                        <Text style={styles.itemCustom}>"{item.customization_text}"</Text>
                                    )}
                                </View>
                                <Text style={styles.itemPrice}>{formatCurrency(item.unit_price_cents * item.quantity)}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Total */}
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Toplam Tutar</Text>
                        <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, styles.cancelBtn]}
                    onPress={handleCancelOrder}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color={Colors.light.error} /> : (
                        <>
                            <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
                            <Text style={styles.cancelBtnText}>Siparişi İptal Et</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.confirmBtn]}
                    onPress={handleContinue}
                    disabled={submitting}
                >
                    <Text style={styles.confirmBtnText}>Ödemeye Devam Et</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                opacity={toast.opacity}
            />
            <ConfirmModal
                visible={confirmModal.visible}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                confirmStyle={confirmModal.confirmStyle}
                onConfirm={confirmModal.onConfirm}
                onCancel={confirmModal.onCancel}
            />
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: Colors.light.warning + '15',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
        alignItems: 'flex-start',
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: Colors.light.text,
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 12,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.light.borderLight,
        gap: 12,
    },
    itemIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: Colors.light.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    itemSub: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    itemCustom: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 4,
        fontStyle: 'italic',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
    },
    footer: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        paddingTop: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        backgroundColor: Colors.light.surface,
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    cancelBtn: {
        backgroundColor: Colors.light.error + '15',
    },
    confirmBtn: {
        backgroundColor: Colors.light.primary,
    },
    cancelBtnText: {
        color: Colors.light.error,
        fontWeight: '600',
        fontSize: 14,
    },
    confirmBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
