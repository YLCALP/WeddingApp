import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { ActivityIndicator, Share, StyleSheet, View } from 'react-native';
import { NoEventView, Toast, useToast } from '../../components/common';
import {
  QRCodeActions,
  QRCodeCard,
  QRCodeHeader,
  QRCodeInfo,
} from '../../components/qrcode';
import { Colors } from '../../constants/Colors';
import { WEB_GUEST_URL } from '../../constants/Config';
import { useAuthStore, useEventStore } from '../../store';

export default function QRCodeScreen() {
  const { user } = useAuthStore();
  const { event, fetchEvent } = useEventStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const toast = useToast();
  const qrRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (user?.id) {
      fetchEvent(user.id).finally(() => setIsLoading(false));
    }
  }, [user?.id]);

  const qrCode = event?.qr_codes?.[0]?.code;
  const qrUrl = qrCode ? `${WEB_GUEST_URL}/${qrCode}` : null;

  const handleShare = async () => {
    if (!qrUrl) return;

    try {
      await Share.share({
        message: `${event?.partner1_name} & ${event?.partner2_name} düğünümüze özel fotoğraf, video ve notlarınızı paylaşmak için bu linki kullanabilirsiniz:\n\n${qrUrl}`,
        title: 'Düğün Anıları Paylaşım Linki',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!qrUrl) return;
    await Clipboard.setStringAsync(qrUrl);
    toast.show('Link kopyalandı!', 'success');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!event || !qrCode || !qrUrl) {
    return (
      <NoEventView
        title="QR Kod Bulunamadı"
        message="Önce bir davet oluşturmanız gerekiyor."
        icon="qr-code-outline"
      />
    );
  }

  return (
    <View style={styles.container}>
      <QRCodeHeader />

      <QRCodeCard
        qrUrl={qrUrl}
        qrCode={qrCode}
        eventType={event.event_type}
        partner1Name={event.partner1_name}
        partner2Name={event.partner2_name}
        qrRef={qrRef}
      />

      <QRCodeActions onShare={handleShare} onCopyLink={handleCopyLink} />

      <QRCodeInfo qrUrl={qrUrl} />

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
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
