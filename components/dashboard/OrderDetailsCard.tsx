import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

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
    total_amount_cents: number;
    packages?: {
        name: string;
    };
}

interface OrderDetailsCardProps {
    purchase: Purchase;
    purchaseItems: PurchaseItem[];
}

const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(cents / 100);
};

export function OrderDetailsCard({ purchase, purchaseItems }: OrderDetailsCardProps) {
    const itemsTotal = purchaseItems.reduce(
        (sum, item) => sum + item.quantity * item.unit_price_cents,
        0
    );
    const packagePrice = purchase.total_amount_cents - itemsTotal;

    return (
        <View style={styles.orderDetailsCard}>
            <Text style={styles.sectionTitle}>Sipariş Detayları</Text>

            {/* Package */}
            <View style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                    <Ionicons name="gift-outline" size={20} color={Colors.light.primary} />
                    <Text style={styles.orderItemName}>
                        {purchase.packages?.name || 'Paket'}
                    </Text>
                </View>
                <Text style={styles.orderItemPrice}>{formatCurrency(packagePrice)}</Text>
            </View>

            {/* Extra Products */}
            {purchaseItems.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                    <View style={styles.orderItemInfo}>
                        <Ionicons name="add-circle-outline" size={20} color={Colors.light.secondary} />
                        <View>
                            <Text style={styles.orderItemName}>
                                {item.products?.name || 'Ürün'} x{item.quantity}
                            </Text>
                            {item.customization_text && (
                                <Text style={styles.customizationText}>
                                    "{item.customization_text}"
                                </Text>
                            )}
                        </View>
                    </View>
                    <Text style={styles.orderItemPrice}>
                        {formatCurrency(item.quantity * item.unit_price_cents)}
                    </Text>
                </View>
            ))}

            {/* Total */}
            <View style={styles.orderTotal}>
                <Text style={styles.orderTotalLabel}>Toplam</Text>
                <Text style={styles.orderTotalAmount}>
                    {formatCurrency(purchase.total_amount_cents)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        color: Colors.light.text,
        marginBottom: 16,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    orderDetailsCard: {
        backgroundColor: Colors.light.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderLight,
    },
    orderItemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    orderItemName: {
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    orderItemPrice: {
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serif,
    },
    customizationText: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        fontStyle: 'italic',
        marginTop: 2,
        fontFamily: Typography.fontFamily.serifRegular,
    },
    orderTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        marginTop: 8,
    },
    orderTotalLabel: {
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serif,
    },
    orderTotalAmount: {
        fontSize: 20,
        color: Colors.light.primary,
        fontFamily: Typography.fontFamily.serif,
    },
});
