import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

// Fix Ionicons on web — load the font file directly
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Ionicons';
      src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `;
  document.head.appendChild(style);
}

registerRootComponent(AppNavigator);