import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { ProductCard } from './ProductCard';
import { Product } from './types';

interface ProductGridProps {
    products: Product[];
    loading: boolean;
    onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, loading, onAddToCart }: ProductGridProps) {
    if (loading) {
        return <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: 20 }} />;
    }

    return (
        <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <ProductCard product={item} onAddToCart={onAddToCart} />
            )}
            contentContainerStyle={styles.listContent}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            ListEmptyComponent={
                <Text style={styles.emptyText}>Bu kategoride ürün bulunamadı.</Text>
            }
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.light.textMuted,
        fontSize: 16,
    },
});
