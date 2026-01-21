import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
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
import {
  EventDetailsInputs,
  EventTypeSelection,
  PartnerInfoInputs,
} from '../../components/event';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store';

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

export default function CreateEventScreen() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = React.useState<string | null>(null);
  const params = useLocalSearchParams<{ eventId: string }>();

  // Use either the ID from params (if editing) or the one we just created
  const activeEventId = createdEventId || params.eventId;

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventForm>({
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

  const onSubmit = async (data: EventForm) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const eventData = {
        user_id: user.id,
        event_type: data.eventType,
        partner1_name: data.partner1Name,
        partner2_name: data.partner2Name,
        event_date: data.eventDate?.toISOString().split('T')[0],
        venue: data.venue || null,
        city: data.city || null,
        description: data.description || null,
        is_active: false, // Start as inactive until payment
      };

      let finalEventId = activeEventId;

      if (activeEventId) {
        // Update existing event
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', activeEventId);

        if (updateError) {
          setError(updateError.message);
          return;
        }
      } else {
        // Create new event
        const { data: event, error: createError } = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single();

        if (createError) {
          setError(createError.message);
          return;
        }

        finalEventId = event.id;
        setCreatedEventId(event.id);
      }

      // Navigate to package selection
      router.push({
        pathname: '/(onboarding)/select-package',
        params: { eventId: finalEventId! },
      });
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.step}>Adım 1/3</Text>
          <Text style={styles.title}>Davetinizi Oluşturun</Text>
          <Text style={styles.subtitle}>
            Düğün veya nişan bilgilerinizi girin
          </Text>
        </View>

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
              <Text style={styles.buttonText}>Devam Et</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { Typography } from '../../constants/Typography';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  step: {
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 8,
    fontFamily: Typography.fontFamily.serif,
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    color: Colors.light.text,
    marginBottom: 8,
    fontFamily: Typography.fontFamily.serif, // Playfair Display
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontFamily: Typography.fontFamily.serifRegular,
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
