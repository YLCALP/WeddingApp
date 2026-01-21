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
  GalleryPreviewCard,
  GuestAccessCard,
  PendingBanner,
  PendingPaymentView,
  VideoHighlightCard
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

  // Get random images for cards
  const galleryCover = React.useMemo(() => {
    const photos = media.filter(m => m.type === 'photo' && m.publicUrl);
    if (photos.length > 0) {
      const randomIndex = Math.floor(Math.random() * photos.length);
      return photos[randomIndex].publicUrl;
    }
    return undefined;
  }, [media]);

  const videoData = React.useMemo(() => {
    const videos = media.filter(m => m.type === 'video' && m.publicUrl);

    if (videos.length > 0) {
      const randomIndex = Math.floor(Math.random() * videos.length);
      return { type: 'video', url: videos[randomIndex].publicUrl };
    }

    // Fallback to random photo if no video
    const photos = media.filter(m => m.type === 'photo' && m.publicUrl && m.publicUrl !== galleryCover);
    if (photos.length > 0) {
      const randomIndex = Math.floor(Math.random() * photos.length);
      return { type: 'image', url: photos[randomIndex].publicUrl };
    }

    return { type: 'none', url: undefined };
  }, [media, galleryCover]);

  const totalMemories = media.length;

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

      <GalleryPreviewCard totalMedia={totalMemories} coverImage={galleryCover} />

      <VideoHighlightCard
        videoSource={videoData.type === 'video' ? videoData.url : undefined}
        coverImage={videoData.type === 'image' ? videoData.url : undefined}
      />

      <GuestAccessCard />
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
