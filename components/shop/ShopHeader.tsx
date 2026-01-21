import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ShopHeaderProps {
    cartItemCount: number;
    onCartPress: () => void;
}

export function ShopHeader({ cartItemCount, onCartPress }: ShopHeaderProps) {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>Mağaza</Text>
            <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
                <Ionicons name="cart-outline" size={24} color={Colors.light.text} />
                {cartItemCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{cartItemCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text,
    },
    cartButton: {
        padding: 8,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.light.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
