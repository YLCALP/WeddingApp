import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { Toast, useToast } from '../components/common';
import {
  EventDetailsInputs,
  EventTypeSelection,
  PartnerInfoInputs,
} from '../components/event';
import { Colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';
import { useAuthStore, useEventStore } from '../store';

const eventSchema = z.object({
  eventType: z.enum(['wedding', 'engagement']),
  partner1Name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  partner2Name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  eventDate: z.date().optional(),
  venue: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
});

type EventForm = z.infer<typeof eventSchema>;

export default function EditEventScreen() {
  const { user } = useAuthStore();
  const { event, fetchEvent } = useEventStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const toast = useToast();

  const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      eventType: 'wedding',
      partner1Name: '',
      partner2Name: '',
      venue: '',
      city: '',
      description: '',
    },
  });

  const eventType = watch('eventType');
  const eventDate = watch('eventDate');

  useEffect(() => {
    if (event) {
      reset({
        eventType: event.event_type,
        partner1Name: event.partner1_name,
        partner2Name: event.partner2_name,
        venue: event.venue || '',
        city: event.city || '',
        description: event.description || '',
        eventDate: event.event_date ? new Date(event.event_date) : undefined,
      });
    }
  }, [event, reset]);

  const onSubmit = async (data: EventForm) => {
    if (!user || !event) return;

    setIsLoading(true);
    setError(null);

    try {
      const eventData = {
        event_type: data.eventType,
        partner1_name: data.partner1Name,
        partner2_name: data.partner2Name,
        event_date: data.eventDate?.toISOString().split('T')[0],
        venue: data.venue || null,
        city: data.city || null,
        description: data.description || null,
      };

      const { error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', event.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await fetchEvent(user.id);

      toast.show('Etkinlik bilgileri güncellendi.', 'success');
      router.back();
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinliği Düzenle</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Event Type Selection */}
        <EventTypeSelection
          value={eventType}
          onChange={(type) => setValue('eventType', type)}
        />

        {/* Partner Names */}
        <PartnerInfoInputs
          control={control}
          errors={errors}
        />

        {/* Event Details */}
        <EventDetailsInputs
          control={control}
          setValue={setValue}
          eventDate={eventDate}
        />

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Değişiklikleri Kaydet</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        opacity={toast.opacity}
      />
    </KeyboardAvoidingView>
  );
}

import { Typography } from '../constants/Typography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: Colors.light.text,
    fontFamily: Typography.fontFamily.serif, // Playfair Display
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    color: Colors.light.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontFamily: Typography.fontFamily.serifRegular,
  },
  button: {
    backgroundColor: Colors.light.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: Typography.fontFamily.serif,
  },
});
