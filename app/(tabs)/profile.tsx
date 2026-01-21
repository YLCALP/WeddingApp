import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ConfirmModal, Toast, useConfirmModal, useToast } from '../../components/common';
import {
  EditProfileModal,
  OrdersModal,
  ProfileCard,
  ProfileHeader,
  ProfileMenu,
} from '../../components/profile';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store';

export default function ProfileScreen() {
  const { profile, logout, isLoading, updateProfile, user } = useAuthStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const toast = useToast();
  const confirmModal = useConfirmModal();

  // States
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [showSubscription, setShowSubscription] = React.useState(false);
  const [subscriptionData, setSubscriptionData] = React.useState<any[]>([]);
  const [loadingSubscription, setLoadingSubscription] = React.useState(false);

  React.useEffect(() => {
    if (profile?.full_name) {
      setEditName(profile.full_name);
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      toast.show('İsim boş olamaz', 'warning');
      return;
    }

    setIsSaving(true);
    const result = await updateProfile({ full_name: editName });
    setIsSaving(false);

    if (result.success) {
      setIsEditing(false);
      toast.show('Profiliniz güncellendi', 'success');
    } else {
      toast.show(result.error || 'Güncelleme başarısız', 'error');
    }
  };

  const handleLogout = () => {
    confirmModal.show({
      title: 'Çıkış Yap',
      message: 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      confirmText: 'Çıkış Yap',
      cancelText: 'İptal',
      confirmStyle: 'destructive',
      onConfirm: async () => {
        await logout();
      },
    });
  };

  const fetchSubscription = async () => {
    if (!user) return;
    setLoadingSubscription(true);
    setShowSubscription(true);

    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        packages (name, storage_limit_bytes),
        purchase_items (
            products (name),
            quantity,
            unit_price_cents
        )
      `)
      .eq('user_id', user.id)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubscriptionData(data);
    }
    setLoadingSubscription(false);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      label: 'Profili Düzenle',
      onPress: () => setIsEditing(true),
    },
    {
      icon: 'notifications-outline',
      label: 'Bildirimler',
      isSwitch: true,
      value: notificationsEnabled,
      onPress: toggleNotifications,
    },
    {
      icon: 'card-outline',
      label: 'Siparişlerim',
      onPress: fetchSubscription,
    },
    {
      icon: 'help-circle-outline',
      label: 'Yardım & Destek',
      onPress: () => toast.show('Destek için: support@rimaqr.com', 'info'),
    },
    {
      icon: 'document-text-outline',
      label: 'Gizlilik Politikası',
      onPress: () => toast.show('Web sitemizden inceleyebilirsiniz.', 'info'),
    },
    {
      icon: 'information-circle-outline',
      label: 'Hakkında',
      onPress: () => toast.show('RimaQR v1.0.0 - build 2026.01.19', 'info'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />

        <ProfileCard
          name={profile?.full_name || ''}
          email={profile?.email || ''}
          onEditPress={() => setIsEditing(true)}
        />

        <ProfileMenu items={menuItems} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.light.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>RimaQR v1.0.0</Text>
      </ScrollView>

      <EditProfileModal
        visible={isEditing}
        name={editName}
        email={profile?.email || ''}
        isSaving={isSaving}
        onNameChange={setEditName}
        onSave={handleUpdateProfile}
        onClose={() => setIsEditing(false)}
        toast={toast}
      />

      <OrdersModal
        visible={showSubscription}
        loading={loadingSubscription}
        orders={subscriptionData}
        onClose={() => setShowSubscription(false)}
      />

      {/* Toast only shown when modals are closed */}
      {!isEditing && (
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          opacity={toast.opacity}
        />
      )}

      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        confirmStyle={confirmModal.confirmStyle}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.error + '10',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textMuted,
    marginTop: 24,
  },
});
