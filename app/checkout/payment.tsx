import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Toast, useToast } from '../../components/common';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { supabase } from '../../lib/supabase';

export default function PaymentScreen() {
    const router = useRouter();
    const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();
    const [loading, setLoading] = useState(true);
    const [paytrToken, setPaytrToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        initializePayment();
    }, [purchaseId]);

    const initializePayment = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch Purchase Details
            const { data: purchase, error: purchaseError } = await supabase
                .from('purchases')
                .select(`
                    *,
                    profiles:user_id (email, full_name, phone)
                `)
                .eq('id', purchaseId)
                .single();

            if (purchaseError || !purchase) {
                throw new Error('Sipariş bilgileri alınamadı.');
            }

            // 2. Fetch Purchase Items (Optional, but good for basket)
            const { data: items } = await supabase
                .from('purchase_items')
                .select('*, products(name)')
                .eq('purchase_id', purchaseId);

            // Construct Basket
            let user_basket = [];
            if (items && items.length > 0) {
                user_basket = items.map(item => [
                    item.products?.name || 'Ürün',
                    (item.price_cents / 100).toFixed(2), // Price as string "10.00"
                    item.quantity
                ]);
            } else {
                // Fallback if no items found
                user_basket = [['RimaQR Paketi', (purchase.total_amount_cents / 100).toFixed(2), 1]];
            }

            // 3. User Info Defaults
            const userEmail = purchase.profiles?.email || 'musteri@rimaqr.com';
            const userName = purchase.recipient_name || purchase.profiles?.full_name || 'Müşteri';
            const userPhone = purchase.recipient_phone || purchase.profiles?.phone || '05555555555';
            const userAddress = purchase.shipping_address || 'Teslimat Adresi Belirtilmedi';

            // Debug: Ensure Session Exists
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error("Oturum süresi dolmuş. Lütfen çıkış yapıp tekrar giriş yapın.");
            }

            // 4. Request PayTR Token
            // SECURITY UPGRADE: We now send purchase_id. The server looks up the price.

            const { data: tokenData, error: functionError } = await supabase.functions.invoke('paytr-token', {
                body: {
                    active_user_basket: user_basket,
                    email: userEmail,
                    purchase_id: purchase.id, // NEW: Server validates this ID
                    user_ip: '127.0.0.1',
                    user_name: userName,
                    user_address: userAddress,
                    user_phone: userPhone,
                    test_mode: '1' // PayTR Test Mode
                },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (functionError) {
                console.error("Function Error:", functionError);
                throw new Error('Ödeme başlatılamadı (Sunucu Hatası).');
            }

            if (tokenData?.status !== 'success' || !tokenData?.token) {
                console.error("Token Error:", tokenData);
                throw new Error(tokenData?.reason || 'Ödeme tokenı alınamadı.');
            }

            // 5. Update Purchase with Merchant OID
            /* 
               My paytr-token function returns { status: 'success', token: '...', merchant_oid: '...' }
               We MUST save this merchant_oid to associate the callback later.
            */
            const { error: updateError } = await supabase
                .from('purchases')
                .update({
                    paytr_merchant_oid: tokenData.merchant_oid
                })
                .eq('id', purchaseId);

            if (updateError) {
                console.error("Update Error:", updateError);
                throw new Error('Sipariş güncellenemedi.');
            }

            setPaytrToken(tokenData.token);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Bir hata oluştu.');
            toast.show(err.message || 'Bir hata oluştu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigationStateChange = (navState: any) => {
        const { url } = navState;

        // Success URL defined in Backend
        if (url.includes('https://rimaqr.com/payment/success')) {
            // Payment Successful
            // Navigate to success screen
            // We should double check status from DB ideally, but for UX we proceed
            router.replace('/checkout/success');
        }
        // Fail URL defined in Backend
        else if (url.includes('https://rimaqr.com/payment/fail')) {
            toast.show('Ödeme işlemi tamamlanamadı.', 'error');
            router.back();
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Ödeme sayfası hazırlanıyor...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.light.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={initializePayment}>
                    <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButtonSimple} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Geri Dön</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Güvenli Ödeme</Text>
                <View style={{ width: 24 }} />
            </View>

            {paytrToken ? (
                <WebView
                    source={{ uri: `https://www.paytr.com/odeme/guvenli/${paytrToken}` }}
                    style={{ flex: 1 }}
                    onNavigationStateChange={handleNavigationStateChange}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webviewLoading}>
                            <ActivityIndicator size="large" color={Colors.light.primary} />
                        </View>
                    )}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Text>Token bekleniyor...</Text>
                </View>
            )}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                opacity={toast.opacity}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: Colors.light.textSecondary,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    retryButton: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontFamily: Typography.fontFamily.serif,
    },
    backButtonSimple: {
        marginTop: 16,
        padding: 10,
    },
    backButtonText: {
        color: Colors.light.textSecondary,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    webviewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
    }
});
