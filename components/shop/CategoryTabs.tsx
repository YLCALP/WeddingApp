import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Category } from './types';

interface CategoryTabsProps {
    categories: Category[];
    selectedCategory: string | null;
    onCategorySelect: (categoryId: string) => void;
}

export function CategoryTabs({ categories, selectedCategory, onCategorySelect }: CategoryTabsProps) {
    return (
        <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryTab, selectedCategory === cat.id && styles.categoryTabActive]}
                        onPress={() => onCategorySelect(cat.id)}
                    >
                        <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    categoriesContainer: {
        height: 50,
        marginBottom: 10,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        backgroundColor: Colors.light.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.light.border,
        height: 36,
        justifyContent: 'center',
    },
    categoryTabActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    categoryText: {
        color: Colors.light.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    categoryTextActive: {
        color: '#fff',
    },
});
