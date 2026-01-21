import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store';
import { supabase } from '../../lib/supabase';

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
  const [showDatePicker, setShowDatePicker] = React.useState(false);
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkinlik Türü</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                eventType === 'wedding' && styles.typeButtonActive,
              ]}
              onPress={() => setValue('eventType', 'wedding')}
            >
              <Ionicons
                name="heart"
                size={32}
                color={eventType === 'wedding' ? Colors.light.primary : Colors.light.textMuted}
              />
              <Text style={[
                styles.typeText,
                eventType === 'wedding' && styles.typeTextActive,
              ]}>
                Düğün
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                eventType === 'engagement' && styles.typeButtonActive,
              ]}
              onPress={() => setValue('eventType', 'engagement')}
            >
              <Ionicons
                name="diamond"
                size={32}
                color={eventType === 'engagement' ? Colors.light.primary : Colors.light.textMuted}
              />
              <Text style={[
                styles.typeText,
                eventType === 'engagement' && styles.typeTextActive,
              ]}>
                Nişan
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Partner Names */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çift Bilgileri</Text>
          
          <View style={styles.partnersRow}>
            <View style={styles.partnerInput}>
              <Controller
                control={control}
                name="partner1Name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.partner1Name && styles.inputError]}
                    placeholder="1. Kişi Adı"
                    placeholderTextColor={Colors.light.textMuted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.partner1Name && (
                <Text style={styles.errorText}>{errors.partner1Name.message}</Text>
              )}
            </View>

            <View style={styles.heartIcon}>
              <Ionicons name="heart" size={24} color={Colors.light.primary} />
            </View>

            <View style={styles.partnerInput}>
              <Controller
                control={control}
                name="partner2Name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.partner2Name && styles.inputError]}
                    placeholder="2. Kişi Adı"
                    placeholderTextColor={Colors.light.textMuted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.partner2Name && (
                <Text style={styles.errorText}>{errors.partner2Name.message}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkinlik Detayları</Text>

          {/* Date Picker */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.light.textMuted} />
            <Text style={[styles.dateText, eventDate && styles.dateTextSelected]}>
              {eventDate
                ? eventDate.toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Tarih Seçin (Opsiyonel)'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate || new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setValue('eventDate', date);
              }}
            />
          )}

          {/* Venue */}
          <Controller
            control={control}
            name="venue"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputWithIcon}>
                <Ionicons name="location-outline" size={20} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.inputIconText}
                  placeholder="Mekan (Opsiyonel)"
                  placeholderTextColor={Colors.light.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />

          {/* City */}
          <Controller
            control={control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputWithIcon}>
                <Ionicons name="business-outline" size={20} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.inputIconText}
                  placeholder="Şehir (Opsiyonel)"
                  placeholderTextColor={Colors.light.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />

          {/* Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Açıklama veya mesaj (Opsiyonel)"
                placeholderTextColor={Colors.light.textMuted}
                multiline
                numberOfLines={3}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  typeButtonActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  typeText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  typeTextActive: {
    color: Colors.light.primary,
  },
  partnersRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  partnerInput: {
    flex: 1,
  },
  heartIcon: {
    paddingTop: 14,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputIconText: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.light.textMuted,
  },
  dateTextSelected: {
    color: Colors.light.text,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
    fontWeight: '600',
  },
});
