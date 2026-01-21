import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { CartItemType, formatCurrency } from './types';

interface CartItemProps {
    item: CartItemType;
    index: number;
    onUpdateQuantity: (index: number, delta: number) => void;
    onRemove: (index: number) => void;
}

export function CartItem({ item, index, onUpdateQuantity, onRemove }: CartItemProps) {
    return (
        <View style={styles.cartItem}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                {item.customization_text && (
                    <Text style={styles.cartItemCustom}>Note: {item.customization_text}</Text>
                )}
                <Text style={styles.cartItemPrice}>
                    {formatCurrency(item.price_cents * item.quantity)}
                </Text>
            </View>

            <View style={styles.qtyWrapper}>
                <View style={styles.qtyContainer}>
                    <TouchableOpacity onPress={() => onUpdateQuantity(index, -1)} style={styles.qtyButton}>
                        <Ionicons name="remove" size={16} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => onUpdateQuantity(index, 1)} style={styles.qtyButton}>
                        <Ionicons name="add" size={16} />
                    </TouchableOpacity>
                </View>
                {(item.min_quantity || 0) > 1 && (
                    <Text style={styles.minQtyMsg}>Min: {item.min_quantity}</Text>
                )}
            </View>

            <TouchableOpacity onPress={() => onRemove(index)} style={{ marginLeft: 10 }}>
                <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.light.surface,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    cartItemName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    cartItemCustom: {
        fontSize: 12,
        color: Colors.light.textMuted,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    cartItemPrice: {
        color: Colors.light.primary,
        fontWeight: '600',
    },
    qtyWrapper: {
        alignItems: 'center',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    qtyButton: {
        padding: 8,
    },
    qtyText: {
        paddingHorizontal: 8,
        fontWeight: '600',
    },
    minQtyMsg: {
        fontSize: 10,
        color: Colors.light.textMuted,
        marginTop: 2,
    },
});
