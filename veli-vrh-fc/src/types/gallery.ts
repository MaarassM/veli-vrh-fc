export type MediaType = 'image' | 'video';

export interface GalleryItem {
  id: string;
  type: MediaType;
  src: string;
  caption: string;
  date: string;
  tags: string[];
  albumId?: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  itemCount: number;
}
