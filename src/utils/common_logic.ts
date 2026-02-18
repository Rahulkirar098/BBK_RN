import { launchImageLibrary, Asset } from 'react-native-image-picker';

export const pickImageFromGallery = async (): Promise<Asset | null> => {
  try {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (res.assets && res.assets.length > 0) {
      return res.assets[0];
    }

    return null;
  } catch (error) {
    console.log('Image Picker Error:', error);
    return null;
  }
};

export const formatDuration = (minutes: number) => {
    if (!minutes) return '';

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs > 0 && mins > 0) {
      return `${hrs} hr ${mins} min`;
    }

    if (hrs > 0) {
      return `${hrs} hr`;
    }

    return `${mins} min`;
  };