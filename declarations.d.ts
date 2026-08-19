import 'react-native';

declare module 'react-native' {
  interface ViewStyle {
    cursor?: string;
    outlineStyle?: string;
    userSelect?: string;
  }
  interface TextStyle {
    cursor?: string;
    outlineStyle?: string;
    userSelect?: string;
  }
  interface ImageStyle {
    cursor?: string;
  }
}