import { Platform } from "react-native";

// Safe web-only styles — returns the style on web, empty object on mobile
export const webOnly = (styles: object) => {
  return Platform.OS === "web" ? styles : {};
};

// Common web-only styles used throughout the app
export const webStyles = {
  cursorPointer: Platform.OS === "web" ? { cursor: "pointer" as any } : {},
  overflowAuto: Platform.OS === "web" ? { overflow: "auto" as any } : {},
  overflowHidden: Platform.OS === "web" ? { overflow: "hidden" as any } : {},
  height100vh: Platform.OS === "web" ? { height: "100vh" as any } : { flex: 1 },
  userSelectNone: Platform.OS === "web" ? { userSelect: "none" as any } : {},
};
