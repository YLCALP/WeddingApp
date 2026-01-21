import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  GalleryHeader,
  MediaDetailModal,
  MediaGrid,
} from '../../components/gallery';
import { Colors } from '../../constants/Colors';
import { useEventStore } from '../../store';

type MediaType = 'all' | 'photo' | 'video' | 'audio' | 'note';

export default function GalleryScreen() {
  const { event, media, fetchMedia, isLoading, deleteMedia } = useEventStore();
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [activeType, setActiveType] = useState<MediaType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (event?.id) {
      fetchMedia(event.id);
    }
  }, [event?.id]);

  const onRefresh = async () => {
    if (event?.id) {
      setRefreshing(true);
      await fetchMedia(event.id);
      setRefreshing(false);
    }
  };

  const handleFilter = (type: MediaType) => {
    setActiveType(type);
    if (type === 'all') {
      fetchMedia(event?.id!);
    } else {
      fetchMedia(event?.id!, type as any);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMedia(id);
    setSelectedMedia(null);
  };

  return (
    <View style={styles.container}>
      <GalleryHeader
        mediaCount={media.length}
        activeType={activeType}
        onFilterChange={handleFilter}
      />

      <MediaGrid
        media={media}
        isLoading={isLoading}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onItemPress={setSelectedMedia}
      />

      <MediaDetailModal
        media={selectedMedia}
        visible={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onDelete={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 60,
  },
});
