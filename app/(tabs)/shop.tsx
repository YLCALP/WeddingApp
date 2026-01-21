import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Toast, useToast } from '../../components/common';
import {
  CartItemType,
  CartModal,
  Category,
  CategoryTabs,
  CustomizationModal,
  Product,
  ProductGrid,
  ShopHeader,
} from '../../components/shop';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useAuthStore, useEventStore } from '../../store';

export default function ShopScreen() {
  const { event, fetchEvent } = useEventStore();
  const { user } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Customization Modal State
  const [customizationVisible, setCustomizationVisible] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [customizationText, setCustomizationText] = useState('');
  const [customizationQuantity, setCustomizationQuantity] = useState(1);

  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: cats, error: catError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      const categoryList = cats || [];
      setCategories(categoryList);
      if (categoryList.length > 0) {
        setSelectedCategory(categoryList[0].id);
      }

      const { data: prods, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (prodError) throw prodError;
      setProducts(prods || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.show('Veriler yüklenirken bir sorun oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartPress = (product: Product) => {
    if (product.customization_required) {
      setPendingProduct(product);
      setCustomizationText('');
      setCustomizationQuantity(product.min_quantity || 1);
      setCustomizationVisible(true);
    } else {
      addToCart(product);
    }
  };

  const updateCustomizationQuantity = (delta: number) => {
    if (!pendingProduct) return;

    setCustomizationQuantity(prev => {
      const increment = pendingProduct?.increment_amount || 1;
      const min = pendingProduct?.min_quantity || 1;
      const newQty = prev + (delta * increment);
      return newQty < min ? min : newQty;
    });
  };

  const confirmCustomization = () => {
    if (pendingProduct) {
      if (!customizationText.trim()) {
        toast.show('Lütfen Kişiselleştirme Notunu giriniz.', 'warning');
        return;
      }
      addToCart(pendingProduct, customizationText, customizationQuantity);
      setCustomizationVisible(false);
      setPendingProduct(null);
    }
  };

  const addToCart = (product: Product, customization?: string, quantityOverride?: number) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item =>
        item.id === product.id && item.customization_text === customization
      );

      const qtyToAdd = quantityOverride !== undefined
        ? quantityOverride
        : (product.min_quantity || 1);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += qtyToAdd;
        return updated;
      } else {
        return [...prev, {
          ...product,
          quantity: qtyToAdd,
          customization_text: customization
        }];
      }
    });

    if (customization) {
      toast.show(`${product.name} (${quantityOverride} adet) sepete eklendi.`, 'success');
    } else {
      toast.show(`${product.name} sepete eklendi.`, 'success');
    }
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const item = prev[index];
      const increment = item.increment_amount || 1;
      const min = item.min_quantity || 1;
      const newQty = item.quantity + (delta * increment);

      if (newQty < min) return prev;

      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price_cents * item.quantity), 0);

  const submitOrder = async () => {
    if (!user || !event) return;
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          event_id: event.id,
          payment_status: 'pending',
          status: 'pending',
          total_amount_cents: cartTotal,
          currency: 'TRY',
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      const itemsToInsert = cart.map(item => ({
        purchase_id: purchase.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price_cents: item.price_cents,
        product_name_snapshot: item.customization_text
          ? `${item.name} (${item.customization_text})`
          : item.name
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      setCart([]);
      setCartVisible(false);

      router.push({
        pathname: '/checkout/address',
        params: { purchaseId: purchase.id }
      });

      fetchEvent(user.id);
    } catch (error: any) {
      console.error(error);
      toast.show(error.message || 'Sipariş verilemedi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  const cartItemCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <View style={styles.container}>
      <ShopHeader
        cartItemCount={cartItemCount}
        onCartPress={() => setCartVisible(true)}
      />

      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <ProductGrid
        products={filteredProducts}
        loading={loading}
        onAddToCart={handleAddToCartPress}
      />

      <CartModal
        visible={cartVisible}
        cart={cart}
        submitting={submitting}
        onClose={() => setCartVisible(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={submitOrder}
      />

      <CustomizationModal
        visible={customizationVisible}
        product={pendingProduct}
        customizationText={customizationText}
        quantity={customizationQuantity}
        onTextChange={setCustomizationText}
        onQuantityChange={updateCustomizationQuantity}
        onConfirm={confirmCustomization}
        onClose={() => setCustomizationVisible(false)}
        toast={toast}
      />

      {/* Toast only shown when customization modal is closed */}
      {!customizationVisible && (
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          opacity={toast.opacity}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 60,
  },
});
