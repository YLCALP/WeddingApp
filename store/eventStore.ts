import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface RimaEvent {
  id: string;
  user_id: string;
  event_type: 'wedding' | 'engagement';
  partner1_name: string;
  partner2_name: string;
  event_date: string | null;
  venue: string | null;
  city: string | null;
  description: string | null;
  cover_image_url: string | null;
  storage_used_bytes: number;
  storage_limit_bytes: number;
  is_active: boolean;
  created_at: string;
  qr_codes?: QRCode[];
}

interface QRCode {
  id: string;
  event_id: string;
  code: string;
  is_active: boolean;
  scan_count: number;
}

export interface Purchase {
  id: string;
  event_id: string;
  package_id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'completed' | 'failed' | 'paid';
  total_amount_cents: number;
  currency: string;
  created_at: string;
  packages?: {
    name: string;
    storage_limit_bytes: number;
  };
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  customization_text: string | null;
  products?: {
    name: string;
  };
}

export interface Media {
  id: string;
  event_id: string;
  type: 'photo' | 'video' | 'audio' | 'note';
  storage_path: string | null;
  file_name: string | null;
  file_size: number;
  mime_type: string | null;
  uploader_name: string | null;
  note_content: string | null;
  is_approved: boolean;
  created_at: string;
  publicUrl?: string;
}

interface EventState {
  event: RimaEvent | null;
  purchase: Purchase | null;
  purchaseItems: PurchaseItem[];
  media: Media[];
  hasActivePackage: boolean;
  isLoading: boolean;
  error: string | null;
  selectedMediaType: 'all' | 'photo' | 'video' | 'audio' | 'note';

  // Actions
  fetchEvent: (userId: string) => Promise<void>;
  fetchMedia: (eventId: string, type?: 'photo' | 'video' | 'audio' | 'note') => Promise<void>;
  deleteMedia: (mediaId: string) => Promise<void>;
  setMediaType: (type: 'all' | 'photo' | 'video' | 'audio' | 'note') => void;
  subscribeToEvent: (eventId: string) => () => void;
  clearEvent: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  event: null,
  purchase: null,
  purchaseItems: [],
  media: [],
  hasActivePackage: false,
  isLoading: false,
  error: null,
  selectedMediaType: 'all',

  fetchEvent: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          qr_codes (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        set({ isLoading: false, error: error.message });
        return;
      }

      set({ event: data as RimaEvent });
      
      // Fetch purchase for this event
      if (data?.id) {
        const { data: purchaseData } = await supabase
          .from('purchases')
          .select(`
            *,
            packages (name, storage_limit_bytes)
          `)
          .eq('event_id', data.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        // Determine access rights
        let hasActivePackage = false;
        
        if (purchaseData) {
          const isCurrentPaid = purchaseData.status === 'completed' || 
                              purchaseData.payment_status === 'completed' || 
                              purchaseData.payment_status === 'paid';
                              
          
          let activeStorageLimit = data.storage_limit_bytes; // Default to existing

          if (isCurrentPaid && purchaseData.packages?.storage_limit_bytes) {
            hasActivePackage = true;
            activeStorageLimit = purchaseData.packages.storage_limit_bytes;
          } else {
            // Current purchase is pending/failed, check for ANY previous completed purchase
            const { data: previousPurchase } = await supabase
              .from('purchases')
              .select(`
                id,
                packages (storage_limit_bytes)
              `)
              .eq('event_id', data.id)
              .or('status.eq.completed,payment_status.eq.completed,payment_status.eq.paid')
              .limit(1)
              .maybeSingle();
              
            if (previousPurchase) {
              hasActivePackage = true;
              if (previousPurchase.packages?.storage_limit_bytes) {
                activeStorageLimit = previousPurchase.packages.storage_limit_bytes;
              }
            }
          }

          // Fetch purchase items
          const { data: itemsData } = await supabase
            .from('purchase_items')
            .select(`
              *,
              products (name)
            `)
          .eq('purchase_id', purchaseData.id);
          
          // Update event storage limit if different
          const finalEvent = { ...data, storage_limit_bytes: activeStorageLimit };

          set({ 
            event: finalEvent as RimaEvent,
            purchase: purchaseData as Purchase,
            purchaseItems: (itemsData || []) as PurchaseItem[],
            hasActivePackage
          });
        } else {
          set({ purchase: null, purchaseItems: [], hasActivePackage: false });
        }
        
        // Fetch media if user has active package (regardless of current purchase status)
        if (hasActivePackage) {
          await get().fetchMedia(data.id);
        }
      }
      
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Etkinlik yüklenemedi' });
    }
  },

  fetchMedia: async (eventId: string, type?: 'photo' | 'video' | 'audio' | 'note') => {
    try {
      let query = supabase
        .from('media')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        set({ error: error.message });
        return;
      }

      // Generate public URLs for each media item
      const mediaWithUrls = (data as Media[]).map(item => {
        if (item.storage_path) {
          const { data: { publicUrl } } = supabase.storage
            .from('event-media')
            .getPublicUrl(item.storage_path);
          return { ...item, publicUrl };
        }
        return item;
      });

      set({ media: mediaWithUrls });
    } catch (error) {
      set({ error: 'Medyalar yüklenemedi' });
    }
  },

  deleteMedia: async (mediaId: string) => {
    try {
      const media = get().media.find(m => m.id === mediaId);
      
      // Delete from storage if there's a storage path
      if (media?.storage_path) {
        await supabase.storage
          .from('event-media')
          .remove([media.storage_path]);
      }

      // Delete from database
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (error) {
        set({ error: error.message });
        return;
      }

      // Update local state
      set({ media: get().media.filter(m => m.id !== mediaId) });
    } catch (error) {
      set({ error: 'Medya silinemedi' });
    }
  },

  setMediaType: (type: 'all' | 'photo' | 'video' | 'audio' | 'note') => {
    set({ selectedMediaType: type });
    
    const { event } = get();
    if (event) {
      if (type === 'all') {
        get().fetchMedia(event.id);
      } else {
        get().fetchMedia(event.id, type);
      }
    }
  },

  subscribeToEvent: (eventId: string) => {
    const channel = supabase
      .channel('public:media')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          // Cast payload to any to access event property safely as types might be mismatched
          const eventType = (payload as any).eventType || (payload as any).event;
          
          if (eventType === 'INSERT') {
            const newMedia = payload.new as Media;
            // Generate public URL for new media
            if (newMedia.storage_path) {
              const { data: { publicUrl } } = supabase.storage
                .from('event-media')
                .getPublicUrl(newMedia.storage_path);
              newMedia.publicUrl = publicUrl;
            }
            
            set(state => ({
              media: [newMedia, ...state.media]
            }));
          } else if (eventType === 'DELETE') {
            const oldRecord = payload.old as { id: string };
            if (oldRecord?.id) {
              set(state => ({
                media: state.media.filter(m => m.id !== oldRecord.id)
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  clearEvent: () => set({ event: null, purchase: null, purchaseItems: [], media: [], hasActivePackage: false, error: null }),
}));
