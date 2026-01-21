import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Toast, useToast } from '../../components/common';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useEventStore } from '../../store';
import { useAuthStore } from '../../store/authStore';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_GALLERY_WIDTH = SCREEN_WIDTH - 48; // Padding on both sides

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  is_active: boolean;
  category_id?: string;
  min_quantity?: number;
  increment_amount?: number;
  customization_required?: boolean;
  customization_prompt?: string;
  image_url?: string | null;
  images?: string[] | null;  // Multiple images support
}

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

interface Package {
  id: string;
  name: string;
  price_cents: number;
  storage_limit_bytes: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  customizationText?: string;
}

export default function AddProductsScreen() {
  const { user } = useAuthStore();
  const { eventId, packageId } = useLocalSearchParams<{ eventId: string, packageId: string }>();
  const toast = useToast();

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [packageDetails, setPackageDetails] = useState<Package | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart State
  const [cart, setCart] = useState<Record<string, CartItem>>({});

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalCustomization, setModalCustomization] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch Package Details
      if (packageId && packageId !== 'undefined') {
        const { data: pkgData } = await supabase
          .from('packages')
          .select('id, name, price_cents, storage_limit_bytes')
          .eq('id', packageId)
          .single();
        if (pkgData) setPackageDetails(pkgData);
      }

      // Fetch Categories
      const { data: catsData } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (catsData && catsData.length > 0) {
        setCategories(catsData);
        setActiveCategoryId(catsData[0].id);
      }

      // Fetch Products
      const { data: prodData, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (error) throw error;
      setProducts(prodData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.show('Veriler yüklenirken bir hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!activeCategoryId) return products;
    // If we implement "All" category later, handle it here. 
    // For now strict filtering if categories exist.
    // If some products have no category, we might want an "Other" tab or show them in "All"
    return products.filter(p => p.category_id === activeCategoryId);
  }, [products, activeCategoryId]);

  const handleProductPress = (product: Product) => {
    // If already in cart, load existing values
    const existing = cart[product.id];
    setModalQuantity(existing ? existing.quantity : (product.min_quantity || 1));
    setModalCustomization(existing?.customizationText || '');
    setCurrentImageIndex(0);
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const updateModalQuantity = (delta: number) => {
    if (!selectedProduct) return;
    const min = selectedProduct.min_quantity || 1;
    const inc = selectedProduct.increment_amount || 1;

    setModalQuantity(prev => {
      const next = prev + (delta * inc);
      return next < min ? min : next;
    });
  };

  const addToCart = () => {
    if (!selectedProduct) return;

    if (selectedProduct.customization_required && !modalCustomization.trim()) {
      toast.show(selectedProduct.customization_prompt || 'Bu ürün için açıklama girilmesi zorunludur.', 'warning');
      return;
    }

    setCart(prev => ({
      ...prev,
      [selectedProduct.id]: {
        product: selectedProduct,
        quantity: modalQuantity,
        customizationText: modalCustomization.trim()
      }
    }));
    setShowProductModal(false);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    if (selectedProduct?.id === productId) {
      setShowProductModal(false);
    }
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(0)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  const calculateTotal = () => {
    return Object.values(cart).reduce((sum, item) => {
      return sum + (item.product.price_cents * item.quantity);
    }, 0);
  };

  // Address State removed

  const handleCompleteOrder = async () => {
    if (!user) {
      toast.show('Kullanıcı oturumu bulunamadı.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Sanitize packageId
      const validPackageId = (packageId && packageId !== 'undefined') ? packageId : null;

      // 1. Create Purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          package_id: validPackageId,
          status: 'pending', // Will be completed after payment
          total_amount_cents: calculateTotal() + (packageDetails?.price_cents || 0),
          currency: 'TRY',
          event_id: (eventId && eventId !== 'undefined') ? eventId : null,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // 2. Create Purchase Items
      const cartItems = Object.values(cart);
      if (cartItems.length > 0) {
        const itemsToInsert = cartItems.map(item => ({
          purchase_id: purchase.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price_cents: item.product.price_cents,
          customization_text: item.customizationText
        }));

        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      // 3. Update Event to Active (Simulated Payment)
      const { error: eventError } = await supabase
        .from('events')
        .update({ is_active: true })
        .eq('id', eventId);

      if (eventError) throw eventError;

      // Refresh event data in store
      if (user?.id) {
        await useEventStore.getState().fetchEvent(user.id);
      }

      setShowSummaryModal(false);

      // Navigate to Address Screen
      router.push({
        pathname: '/checkout/address',
        params: { purchaseId: purchase.id }
      });

    } catch (error: any) {
      console.error('Order error:', error);
      toast.show(error.message || 'Sipariş oluşturulurken bir hata oluştu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.step}>Adım 3/3</Text>
        </View>
        <Text style={styles.title}>Ekstra Hizmetler</Text>
        <Text style={styles.subtitle}>Etkinliğinize özel detaylar ekleyin</Text>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTab, activeCategoryId === cat.id && styles.categoryTabActive]}
                onPress={() => setActiveCategoryId(cat.id)}
              >
                <Text style={[styles.categoryText, activeCategoryId === cat.id && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Products Grid */}
        <View style={styles.productsContainer}>
          {filteredProducts.map((product) => {
            const inCart = cart[product.id];
            return (
              <TouchableOpacity
                key={product.id}
                style={[styles.productCard, inCart && styles.productCardSelected]}
                onPress={() => handleProductPress(product)}
                activeOpacity={0.8}
              >
                <View style={styles.productContent}>
                  {/* Product Image */}
                  {product.image_url && (
                    <Image
                      source={{ uri: product.image_url }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={[styles.productInfo, product.image_url && { flex: 1, marginLeft: 12 }]}>
                    <Text style={[styles.productName, inCart && styles.productNameSelected]}>{product.name}</Text>
                    {product.description && (
                      <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Text style={[styles.productPrice, inCart && styles.productPriceSelected]}>
                        {formatCurrency(product.price_cents)}
                      </Text>
                      {(product.min_quantity && product.min_quantity > 1) && (
                        <Text style={styles.minQtyBadge}>min {product.min_quantity} adet</Text>
                      )}
                    </View>
                  </View>

                  {inCart ? (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{inCart.quantity}x</Text>
                    </View>
                  ) : (
                    <View style={styles.addButton}>
                      <Ionicons name="add" size={24} color={Colors.light.primary} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Bu kategoride ürün bulunmuyor.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomContainer}>
        <View>
          <Text style={styles.totalLabel}>Ekstra Toplamı</Text>
          <Text style={styles.totalAmount}>{formatCurrency(calculateTotal())}</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowSummaryModal(true)}
        >
          <Text style={styles.buttonText}>
            {Object.keys(cart).length === 0 ? 'Atla & Tamamla' : 'Sepeti Onayla'}
          </Text>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Product Detail Modal */}
      <Modal visible={showProductModal} transparent animationType="slide" onRequestClose={() => setShowProductModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                {/* Debug Log */}
                {console.log('Selected Product Data:', JSON.stringify(selectedProduct, null, 2))}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                  <TouchableOpacity onPress={() => setShowProductModal(false)}>
                    <Ionicons name="close" size={24} color={Colors.light.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 450 }}>
                  {/* Image Gallery */}
                  {(() => {
                    // Build images array: use images if available, fallback to image_url
                    const productImages: string[] = [];
                    if (selectedProduct.images && selectedProduct.images.length > 0) {
                      productImages.push(...selectedProduct.images);
                    } else if (selectedProduct.image_url) {
                      productImages.push(selectedProduct.image_url);
                    }

                    if (productImages.length === 0) return null;

                    return (
                      <View style={styles.imageGalleryContainer}>
                        <ScrollView
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          onMomentumScrollEnd={(event) => {
                            const index = Math.round(event.nativeEvent.contentOffset.x / IMAGE_GALLERY_WIDTH);
                            setCurrentImageIndex(index);
                          }}
                        >
                          {productImages.map((imgUrl, index) => (
                            <TouchableOpacity
                              key={index}
                              activeOpacity={0.9}
                              onPress={() => setFullScreenVisible(true)}
                            >
                              <Image
                                source={{ uri: imgUrl }}
                                style={[styles.modalGalleryImage, { width: IMAGE_GALLERY_WIDTH }]}
                                resizeMode="cover"
                              />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        {productImages.length > 1 && (
                          <View style={styles.paginationDots}>
                            {productImages.map((_, index) => (
                              <View
                                key={index}
                                style={[
                                  styles.dot,
                                  index === currentImageIndex && styles.activeDot
                                ]}
                              />
                            ))}
                          </View>
                        )}

                        {/* Full Screen Image Modal */}
                        <Modal
                          visible={fullScreenVisible}
                          transparent={true}
                          animationType="fade"
                          onRequestClose={() => setFullScreenVisible(false)}
                        >
                          <View style={styles.fullScreenContainer}>
                            <TouchableOpacity
                              style={styles.fullScreenCloseBtn}
                              onPress={() => setFullScreenVisible(false)}
                              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            >
                              <Ionicons name="close" size={30} color="#fff" />
                            </TouchableOpacity>

                            <ScrollView
                              horizontal
                              pagingEnabled
                              showsHorizontalScrollIndicator={false}
                              contentOffset={{ x: currentImageIndex * Dimensions.get('window').width, y: 0 }}
                              onMomentumScrollEnd={(event) => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width);
                                setCurrentImageIndex(index);
                              }}
                            >
                              {productImages.map((imgUrl, index) => (
                                <View key={index} style={{ width: Dimensions.get('window').width, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                  <Image
                                    source={{ uri: imgUrl }}
                                    style={{ width: '100%', height: '80%' }}
                                    resizeMode="contain"
                                  />
                                </View>
                              ))}
                            </ScrollView>

                            {/* Full Screen Pagination */}
                            {productImages.length > 1 && (
                              <View style={styles.fullScreenPagination}>
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                                  {currentImageIndex + 1} / {productImages.length}
                                </Text>
                              </View>
                            )}
                          </View>
                        </Modal>
                      </View>
                    );
                  })()}

                  <Text style={styles.modalDesc}>{selectedProduct.description}</Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Adet</Text>
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateModalQuantity(-1)}
                      >
                        <Ionicons name="remove" size={24} color={Colors.light.text} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{modalQuantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => updateModalQuantity(1)}
                      >
                        <Ionicons name="add" size={24} color={Colors.light.text} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {(selectedProduct.customization_required || selectedProduct.customization_prompt) && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>
                        Kişiselleştirme {selectedProduct.customization_required && <Text style={{ color: 'red' }}>*</Text>}
                      </Text>
                      <Text style={styles.helperText}>{selectedProduct.customization_prompt || 'Lütfen gerekli bilgileri giriniz:'}</Text>
                      <TextInput
                        style={styles.textArea}
                        multiline
                        placeholder="Buraya yazın..."
                        value={modalCustomization}
                        onChangeText={setModalCustomization}
                      />
                    </View>
                  )}

                  <Text style={styles.modalPrice}>
                    Toplam: {formatCurrency(selectedProduct.price_cents * modalQuantity)}
                  </Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  {cart[selectedProduct.id] && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.removeBtn]}
                      onPress={() => removeFromCart(selectedProduct.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.actionBtn, styles.confirmBtn]} onPress={addToCart}>
                    <Text style={styles.confirmBtnText}>{cart[selectedProduct.id] ? 'Güncelle' : 'Sepete Ekle'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Summary Modal */}
      <Modal visible={showSummaryModal} transparent animationType="fade" onRequestClose={() => setShowSummaryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '70%' }]}>
            <Text style={styles.modalTitle}>Sipariş Özeti</Text>

            <ScrollView style={{ flex: 1, marginTop: 16 }}>
              <Text style={styles.sectionLabel}>Seçilen Paket</Text>
              {packageDetails ? (
                <View style={styles.summaryItem}>
                  <Ionicons name="cube-outline" size={20} color={Colors.light.primary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: '600', color: Colors.light.text }}>{packageDetails.name}</Text>
                    <Text style={{ fontSize: 13, color: Colors.light.textSecondary }}>{packageDetails.storage_limit_bytes ? formatBytes(packageDetails.storage_limit_bytes) : ''}</Text>
                  </View>
                  <Text style={{ fontWeight: '700', color: Colors.light.text }}>
                    {formatCurrency(packageDetails.price_cents)}
                  </Text>
                </View>
              ) : (
                <View style={styles.summaryItem}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.light.primary} />
                  ) : (
                    <Text style={{ fontStyle: 'italic', color: Colors.light.textSecondary }}>Paket seçilmedi</Text>
                  )}
                </View>
              )}

              {Object.values(cart).length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Ekstra Hizmetler</Text>
                  {Object.values(cart).map((item, i) => (
                    <View key={i} style={styles.summaryItemCol}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontWeight: '600' }}>{item.product.name} ({item.quantity} adet)</Text>
                        <Text>{formatCurrency(item.product.price_cents * item.quantity)}</Text>
                      </View>
                      {item.customizationText ? (
                        <Text style={{ fontSize: 12, color: Colors.light.textSecondary, marginTop: 4, fontStyle: 'italic' }}>
                          "{item.customizationText}"
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </>
              )}

              <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.light.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, color: Colors.light.textSecondary }}>Paket Tutarı</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>{packageDetails ? formatCurrency(packageDetails.price_cents) : '-'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, color: Colors.light.textSecondary }}>Ekstra Hizmetler</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>{formatCurrency(calculateTotal())}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.light.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '700' }}>Genel Toplam</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.light.primary }}>
                    {packageDetails ? formatCurrency(calculateTotal() + packageDetails.price_cents) : '-'}
                  </Text>
                </View>


              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setShowSummaryModal(false)}>
                <Text style={styles.cancelBtnText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={handleCompleteOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <Text style={styles.confirmBtnText}>Onayla ve Bitir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        opacity={toast.opacity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12
  },
  backButton: {},
  step: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 8,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: Colors.light.primary,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.textMuted
  },
  categoryTextActive: {
    color: Colors.light.primary,
    fontWeight: '600'
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 16
  },
  productsContainer: {
    gap: 16,
  },
  productCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  productCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '08',
  },
  productContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.light.border,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  productNameSelected: {
    color: Colors.light.primary,
  },
  productDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  productPriceSelected: {
    color: Colors.light.primary,
  },
  minQtyBadge: {
    fontSize: 11,
    color: Colors.light.primary,
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    overflow: 'hidden'
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeContainer: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 30, // Safe area
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.light.textMuted
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary
  },
  button: {
    backgroundColor: Colors.light.primary,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20
  },
  modalSection: {
    marginBottom: 20
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyText: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center'
  },
  helperText: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginBottom: 8
  },
  textArea: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 16
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmBtn: {
    backgroundColor: Colors.light.primary,
    flex: 2
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  removeBtn: {
    backgroundColor: Colors.light.error + '15',
  },
  cancelBtn: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  cancelBtnText: {
    color: Colors.light.text
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    marginBottom: 8
  },
  summaryItemCol: {
    padding: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary
  },
  imageGalleryContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.light.border,
  },
  modalGalleryImage: {
    height: 250,
    backgroundColor: Colors.light.border,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  fullScreenPagination: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  }
});
