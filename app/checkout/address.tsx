import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddressData, AddressForm } from '../../components/AddressForm';
import { Toast, useToast } from '../../components/common';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { supabase } from '../../lib/supabase';

export default function AddressScreen() {
    const router = useRouter();
    const { purchaseId } = useLocalSearchParams<{ purchaseId: string }>();
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();
    const [addressData, setAddressData] = useState<AddressData>({
        recipient_name: '',
        recipient_phone: '',
        shipping_address: '',
        city: '',
        district: '',
    });

    useEffect(() => {
        if (!purchaseId) {
            toast.show('Sipariş bulunamadı.', 'error');
            router.back();
            return;
        }

        fetchUserProfile();
    }, [purchaseId]);

    const fetchUserProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.full_name) {
            setAddressData(prev => ({ ...prev, recipient_name: user.user_metadata.full_name }));
        }
    };

    const handleSubmit = async () => {
        if (!addressData.recipient_name || !addressData.recipient_phone || !addressData.shipping_address || !addressData.city || !addressData.district) {
            toast.show('Lütfen teslimat adres bilgilerini eksiksiz doldurunuz.', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user found');

            console.log('Updating address for purchase:', purchaseId, 'User:', user.id);

            const { data, error } = await supabase
                .from('purchases')
                .update({
                    recipient_name: addressData.recipient_name,
                    recipient_phone: addressData.recipient_phone,
                    shipping_address: addressData.shipping_address,
                    city: addressData.city,
                    district: addressData.district,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', purchaseId)
                .select('id');

            if (error) throw error;

            if (!data || data.length === 0) {
                console.error('No rows updated. Possible RLS issue or wrong ID.');
                throw new Error('Sipariş güncellenemedi (İzin hatası veya kayıt bulunamadı).');
            }

            // Navigate to Payment Screen
            router.push({
                pathname: '/checkout/payment',
                params: { purchaseId }
            });
        } catch (error) {
            console.error('Error updating address:', error);
            toast.show('Adres bilgileri kaydedilemedi.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Teslimat Bilgileri</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.content, { flexGrow: 1 }]}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}>
                    Lütfen siparişinizin teslim edileceği adres bilgilerini giriniz.
                </Text>

                <AddressForm
                    initialData={addressData}
                    onDataChange={setAddressData}
                />

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitButtonText}>
                        {submitting ? 'Kaydediliyor...' : 'Kaydet ve Tamamla'}
                    </Text>
                </TouchableOpacity>

                {/* Spacer for keyboard */}
                <View style={{ height: 100 }} />
            </KeyboardAwareScrollView>
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
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
    },
    content: {
        padding: 20,
    },
    description: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 24,
        textAlign: 'center',
        fontFamily: Typography.fontFamily.serifRegular,
    },
    submitButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Typography.fontFamily.serif,
    },
});
