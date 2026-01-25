import { Dimensions, Platform } from 'react-native';

//Screen Constatnts
const SCREEN_HEIGHT = 736;
const SCREEN_WIDTH = 414;

export const { height, width } = Dimensions.get('window');

export default function (units = 1) {
  return (width / SCREEN_WIDTH) * units;
}

export const platform = Platform.OS;

export const verticalScale = (size: number) => (height / SCREEN_HEIGHT) * size;

export const horizontalScale = (units = 1) => (width / SCREEN_WIDTH) * units;
