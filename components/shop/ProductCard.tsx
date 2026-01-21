import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Product, formatCurrency } from './types';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    return (
        <View style={styles.productCard}>
            <Image
                source={{ uri: product.images?.[0] || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
                resizeMode="cover"
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>{formatCurrency(product.price_cents)}</Text>

                <View style={styles.rulesContainer}>
                    {product.min_quantity && product.min_quantity > 1 && (
                        <Text style={styles.ruleText}>Min: {product.min_quantity} adet</Text>
                    )}
                    {product.customization_required && (
                        <Text style={styles.customBadge}>Kişiye Özel</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => onAddToCart(product)}
                >
                    <Text style={styles.addButtonText}>Sepete Ekle</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    productCard: {
        width: '48%',
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#eee',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.text,
        marginBottom: 4,
        height: 40,
    },
    productPrice: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.serif,
        color: Colors.light.primary,
        marginBottom: 8,
    },
    rulesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginBottom: 8,
    },
    ruleText: {
        fontSize: 10,
        fontFamily: Typography.fontFamily.serifRegular,
        color: Colors.light.textMuted,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    customBadge: {
        fontSize: 10,
        color: Colors.light.secondary,
        backgroundColor: Colors.light.secondary + '15',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: Typography.fontFamily.serif,
    },
    addButton: {
        backgroundColor: Colors.light.secondary + '20',
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: Colors.light.secondary,
        fontSize: 12,
        fontFamily: Typography.fontFamily.serif,
    },
});
