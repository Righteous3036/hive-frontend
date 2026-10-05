import { DeviceEventEmitter } from "react-native";

export const GROUP_UPDATED_EVENT = "GROUP_UPDATED_EVENT";
export const THEME_UPDATED_EVENT = "THEME_UPDATED_EVENT";

export interface GroupUpdatePayload {
  groupId: number;
  cover_image?: string | null;
  profile_image?: string | null;
  name?: string;
  description?: string;
  location?: string | null;
  meeting_time?: string | null;
  meeting_frequency?: string | null;
  max_members?: number | null;
  category?: string;
  is_private?: boolean;
  require_approval?: boolean;
  [key: string]: any;
}

export interface ThemeUpdatePayload {
  theme_background: string | null;
  userId?: number;
}

export function emitGroupUpdated(payload: GroupUpdatePayload) {
  DeviceEventEmitter.emit(GROUP_UPDATED_EVENT, payload);
}

export function emitThemeUpdated(payload: ThemeUpdatePayload) {
  DeviceEventEmitter.emit(THEME_UPDATED_EVENT, payload);
}
