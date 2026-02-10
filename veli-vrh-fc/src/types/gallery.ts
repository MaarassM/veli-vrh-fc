export type MediaType = 'image' | 'video';

export interface GalleryItem {
  id: string;
  type: MediaType;
  src: string;
  caption: string;
  date: string;
  tags: string[];
}
