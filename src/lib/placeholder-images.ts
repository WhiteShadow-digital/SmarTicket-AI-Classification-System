import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Returns a default placeholder if no specific image is found
export const getPlaceholderImage = (id: string): ImagePlaceholder => {
  const image = data.placeholderImages.find(p => p.id === id);
  if (image) {
    return image;
  }
  return {
    id,
    description: 'Default student portrait',
    imageUrl: `https://picsum.photos/seed/${id}/400/400`,
    imageHint: 'student portrait',
  };
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
