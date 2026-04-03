import { Platform } from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { appleMapURL, googleMapURL } from '../config';

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


type FormatDurationOptions = {
  short?: boolean;     // "1h 30m"
  showZero?: boolean;  // show "0 min"
};

type FirestoreTimestamp = { toDate: () => Date };
type SessionDateType = 'time' | 'date' | 'full';

export const formatDuration = (
  minutes: number | null | undefined,
  options?: FormatDurationOptions
): string => {
  if (minutes == null || isNaN(minutes)) return '';

  if (minutes === 0) {
    return options?.showZero ? '0 min' : '';
  }

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const short = options?.short;

  const hLabel = short ? 'h' : hrs === 1 ? 'hr' : 'hrs';
  const mLabel = short ? 'm' : 'min';

  if (hrs > 0 && mins > 0) {
    return short
      ? `${hrs}${hLabel} ${mins}${mLabel}`
      : `${hrs} ${hLabel} ${mins} ${mLabel}`;
  }

  if (hrs > 0) {
    return short ? `${hrs}${hLabel}` : `${hrs} ${hLabel}`;
  }

  return short ? `${mins}${mLabel}` : `${mins} ${mLabel}`;
};

export const formatDate = (
  input: Date | string | number | FirestoreTimestamp | null | undefined,
  type: SessionDateType = 'time'
): string => {
  if (!input) return '';

  let date: Date;

  if (typeof input === 'object' && input !== null && 'toDate' in input) {
    date = input.toDate();
  } else {
    date = new Date(input);
  }

  if (isNaN(date.getTime())) return '';

  const now = new Date();

  // 👉 Normalize to local midnight (VERY IMPORTANT)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // ✅ TIME
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: undefined,
  });

  if (type === 'time') return timeStr;

  // ✅ DATE LABELS
  if (type === 'date') {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';

    return date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // ✅ FULL
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Tomorrow, ${timeStr}`;

  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: undefined,
  });
};

export const mapDirection = (lat: string, lng: string) => {
  let platform = Platform.OS === 'android';
  return platform ? `${googleMapURL}${lat},${lng}` : `${appleMapURL}${lat},${lng}`;
}