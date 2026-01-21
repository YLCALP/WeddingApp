import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { NoEventView } from '../../components/common';
import {
  DashboardHeader,
  EventCard,
  MediaStatsGrid,
  PendingBanner,
  PendingPaymentView,
  QuickActions,
  StorageCard,
} from '../../components/dashboard';
import { Colors } from '../../constants/Colors';
import { useAuthStore, useEventStore } from '../../store';

export default function DashboardScreen() {
  const { user, profile } = useAuthStore();
  const {
    event,
    purchase,
    purchaseItems,
    media,
    hasActivePackage,
    isLoading,
    fetchEvent,
    subscribeToEvent,
  } = useEventStore();
  const [refreshing, setRefreshing] = React.useState(false);

  // Subscribe to real-time updates
  React.useEffect(() => {
    if (event?.id) {
      const unsubscribe = subscribeToEvent(event.id);
      return () => unsubscribe();
    }
  }, [event?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        fetchEvent(user.id);
      }
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchEvent(user.id);
    }
    setRefreshing(false);
  };

  const mediaStats = {
    photos: media.filter((m) => m.type === 'photo').length,
    videos: media.filter((m) => m.type === 'video').length,
    audios: media.filter((m) => m.type === 'audio').length,
    notes: media.filter((m) => m.type === 'note').length,
  };

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  // No event state
  if (!event) {
    return (
      <NoEventView
        title="Henüz Davetiniz Yok"
        message="Düğün veya nişan davetinizi oluşturun ve anılarınızı toplamaya başlayın."
        buttonText="Davet Oluştur"
        onButtonPress={() => router.push('/(onboarding)/create-event')}
        icon="heart-outline"
      />
    );
  }

  // Pending payment state (no active package)
  if (!hasActivePackage) {
    return (
      <PendingPaymentView
        event={event}
        purchase={purchase}
        purchaseItems={purchaseItems}
        profile={profile}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    );
  }

  // Main dashboard view
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.light.primary]}
          tintColor={Colors.light.primary}
        />
      }
    >
      <DashboardHeader userName={profile?.full_name || 'Kullanıcı'} />

      {/* Pending Order Banner */}
      {purchase &&
        purchase.status !== 'completed' &&
        purchase.payment_status !== 'completed' &&
        purchase.payment_status !== 'paid' && (
          <PendingBanner purchaseId={purchase.id} />
        )}

      <EventCard event={event} onEditPress={() => router.push('/edit-event')} />

      <StorageCard
        usedBytes={event.storage_used_bytes}
        limitBytes={event.storage_limit_bytes}
      />

      <MediaStatsGrid stats={mediaStats} />

      <QuickActions />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
