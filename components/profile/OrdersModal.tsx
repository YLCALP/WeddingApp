import { Ionicons } from '@expo/vector-icons';
import {
    ActivityIndicator,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { formatBytes, formatCurrency } from './utils';

interface OrdersModalProps {
    visible: boolean;
    loading: boolean;
    orders: any[];
    onClose: () => void;
}

export function OrdersModal({ visible, loading, orders, onClose }: OrdersModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { height: '70%' }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Siparişlerim</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {orders.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>Aktif bir sipariş bulunamadı.</Text>
                                </View>
                            ) : (
                                orders.map((order: any) => (
                                    <View key={order.id} style={styles.orderCard}>
                                        {/* Header: Package Name & Status */}
                                        <View style={styles.orderHeader}>
                                            <Text style={styles.packageName}>
                                                {order.packages?.name || 'Paket'}
                                            </Text>
                                            <View style={styles.statusBadge}>
                                                <Text style={styles.statusText}>Tamamlandı</Text>
                                            </View>
                                        </View>

                                        {/* Date & Storage */}
                                        <View style={styles.orderMeta}>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="calendar-outline" size={14} color={Colors.light.textSecondary} />
                                                <Text style={styles.metaText}>
                                                    {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </Text>
                                            </View>
                                            <View style={styles.metaItem}>
                                                <Ionicons name="cloud-outline" size={14} color={Colors.light.textSecondary} />
                                                <Text style={styles.metaText}>
                                                    {formatBytes(order.packages?.storage_limit_bytes || 0)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Extra Products */}
                                        {order.purchase_items?.length > 0 && (
                                            <View style={styles.itemsSection}>
                                                <Text style={styles.itemsSectionTitle}>EK HİZMETLER</Text>
                                                {order.purchase_items.map((item: any, i: number) => (
                                                    <View key={i} style={styles.itemRow}>
                                                        <Text style={styles.itemName}>
                                                            {item.quantity} x {item.products?.name}
                                                        </Text>
                                                        <Text style={styles.itemPrice}>
                                                            {formatCurrency(item.quantity * item.unit_price_cents)}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}

                                        {/* Total Price */}
                                        <View style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>Toplam Tutar</Text>
                                            <Text style={styles.totalValue}>
                                                {formatCurrency(order.total_amount_cents)}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.light.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textMuted,
    },
    orderCard: {
        backgroundColor: Colors.light.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    packageName: {
        fontFamily: Typography.fontFamily.serif,
        fontSize: 18,
        color: Colors.light.text,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: Colors.light.secondary + '20',
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.secondary,
    },
    orderMeta: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textSecondary,
    },
    itemsSection: {
        marginTop: 8,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.light.borderLight,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderLight,
    },
    itemsSectionTitle: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.textMuted,
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.text,
    },
    itemPrice: {
        fontSize: 14,
        color: Colors.light.text,
        fontFamily: Typography.fontFamily.serifRegular,
        fontWeight: '500',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    totalLabel: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.textSecondary,
    },
    totalValue: {
        fontSize: 20,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.primary,
    },
});
