import { Ionicons } from '@expo/vector-icons';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { CartItem } from './CartItem';
import { CartItemType, formatCurrency } from './types';

interface CartModalProps {
    visible: boolean;
    cart: CartItemType[];
    submitting: boolean;
    onClose: () => void;
    onUpdateQuantity: (index: number, delta: number) => void;
    onRemove: (index: number) => void;
    onCheckout: () => void;
}

export function CartModal({
    visible,
    cart,
    submitting,
    onClose,
    onUpdateQuantity,
    onRemove,
    onCheckout,
}: CartModalProps) {
    const cartTotal = cart.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Sepetim</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color={Colors.light.text} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={cart}
                    keyExtractor={(item, index) => item.id + index}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.emptyCart}>Sepetiniz boş.</Text>}
                    renderItem={({ item, index }) => (
                        <CartItem
                            item={item}
                            index={index}
                            onUpdateQuantity={onUpdateQuantity}
                            onRemove={onRemove}
                        />
                    )}
                />

                {cart.length > 0 && (
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Toplam:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(cartTotal)}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={onCheckout}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.checkoutText}>Siparişi Tamamla</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderLight,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyCart: {
        textAlign: 'center',
        marginTop: 50,
        color: Colors.light.textMuted,
        fontSize: 16,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.light.borderLight,
        marginBottom: 20,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    checkoutButton: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    checkoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
