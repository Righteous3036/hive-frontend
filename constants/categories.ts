import { ImageSourcePropType } from 'react-native';

export const CATEGORY_3D_ICONS: Record<string, ImageSourcePropType> = {
  all: require('../assets/images/categories/all.png'),
  study: require('../assets/images/categories/study.png'),
  sports: require('../assets/images/categories/sports.png'),
  tech: require('../assets/images/categories/tech.png'),
  arts: require('../assets/images/categories/arts.png'),
  dance: require('../assets/images/categories/dance.png'),
  business: require('../assets/images/categories/business.png'),
  health: require('../assets/images/categories/health.png'),
  social: require('../assets/images/categories/social.png'),
};

export const CATEGORY_VECTOR_ICONS: Record<string, string> = {
  all: 'apps-outline',
  study: 'book-outline',
  sports: 'football-outline',
  tech: 'laptop-outline',
  arts: 'color-palette-outline',
  dance: 'musical-notes-outline',
  business: 'briefcase-outline',
  health: 'fitness-outline',
  social: 'globe-outline',
};

export const CATEGORY_COLORS: Record<string, string> = {
  study: '#4C9BE8',
  sports: '#34C759',
  tech: '#7C5CFC',
  arts: '#EF4444',
  dance: '#EC4899',
  business: '#F5A623',
  health: '#10B981',
  social: '#F97316',
};

export interface CategoryItem {
  id: string;
  label: string;
  image: ImageSourcePropType;
  icon: string;
  color: string;
}

export const CATEGORIES_LIST: CategoryItem[] = [
  { id: 'all', label: 'All', image: CATEGORY_3D_ICONS.all, icon: CATEGORY_VECTOR_ICONS.all, color: '#00467F' },
  { id: 'study', label: 'Study', image: CATEGORY_3D_ICONS.study, icon: CATEGORY_VECTOR_ICONS.study, color: CATEGORY_COLORS.study },
  { id: 'sports', label: 'Sports', image: CATEGORY_3D_ICONS.sports, icon: CATEGORY_VECTOR_ICONS.sports, color: CATEGORY_COLORS.sports },
  { id: 'tech', label: 'Tech', image: CATEGORY_3D_ICONS.tech, icon: CATEGORY_VECTOR_ICONS.tech, color: CATEGORY_COLORS.tech },
  { id: 'arts', label: 'Arts', image: CATEGORY_3D_ICONS.arts, icon: CATEGORY_VECTOR_ICONS.arts, color: CATEGORY_COLORS.arts },
  { id: 'dance', label: 'Dance', image: CATEGORY_3D_ICONS.dance, icon: CATEGORY_VECTOR_ICONS.dance, color: CATEGORY_COLORS.dance },
  { id: 'business', label: 'Business', image: CATEGORY_3D_ICONS.business, icon: CATEGORY_VECTOR_ICONS.business, color: CATEGORY_COLORS.business },
  { id: 'health', label: 'Health', image: CATEGORY_3D_ICONS.health, icon: CATEGORY_VECTOR_ICONS.health, color: CATEGORY_COLORS.health },
  { id: 'social', label: 'Social', image: CATEGORY_3D_ICONS.social, icon: CATEGORY_VECTOR_ICONS.social, color: CATEGORY_COLORS.social },
];

export function getCategory3DIcon(category?: string | null): ImageSourcePropType {
  const key = (category || 'all').toLowerCase().trim();
  return CATEGORY_3D_ICONS[key] || CATEGORY_3D_ICONS.all;
}

export function getCategoryVectorIcon(category?: string | null): string {
  const key = (category || 'all').toLowerCase().trim();
  return CATEGORY_VECTOR_ICONS[key] || 'pricetag-outline';
}
