import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

interface Package {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  storage_limit_bytes: number;
  features: string[];
}

export default function SelectPackageScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [packages, setPackages] = React.useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(0)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleContinue = () => {
    if (!selectedPackage) return;
    
    router.push({
      pathname: '/(onboarding)/add-products',
      params: { eventId, packageId: selectedPackage },
    });
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.step}>Adım 2/3</Text>
          <Text style={styles.title}>Paket Seçin</Text>
          <Text style={styles.subtitle}>
            Size uygun depolama paketini seçin
          </Text>
        </View>

        {/* Packages */}
        <View style={styles.packagesContainer}>
          {packages.map((pkg, index) => {
            const isSelected = selectedPackage === pkg.id;
            const isPopular = index === 1; // Middle package as popular

            return (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                  isPopular && styles.packageCardPopular,
                ]}
                onPress={() => setSelectedPackage(pkg.id)}
                activeOpacity={0.7}
              >
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popüler</Text>
                  </View>
                )}

                <View style={styles.packageHeader}>
                  <Text style={[styles.packageName, isSelected && styles.packageNameSelected]}>
                    {pkg.name}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.packagePrice, isSelected && styles.packagePriceSelected]}>
                      {formatCurrency(pkg.price_cents)}
                    </Text>
                  </View>
                </View>

                {pkg.description && (
                  <Text style={styles.packageDescription}>{pkg.description}</Text>
                )}

                <View style={styles.storageContainer}>
                  <Ionicons name="cloud-outline" size={20} color={Colors.light.primary} />
                  <Text style={styles.storageText}>
                    {formatBytes(pkg.storage_limit_bytes)} Depolama
                  </Text>
                </View>

                {pkg.features && pkg.features.length > 0 && (
                  <View style={styles.featuresContainer}>
                    {pkg.features.map((feature, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={18} color={Colors.light.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.light.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {packages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color={Colors.light.textMuted} />
            <Text style={styles.emptyText}>Henüz paket bulunmuyor</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.button, !selectedPackage && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selectedPackage}
        >
          <Text style={styles.buttonText}>Devam Et</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  step: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.light.border,
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '08',
  },
  packageCardPopular: {
    borderColor: Colors.light.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  packageNameSelected: {
    color: Colors.light.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  packagePriceSelected: {
    color: Colors.light.primary,
  },
  packageDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  storageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '15',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  storageText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.textMuted,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  button: {
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.textMuted,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
