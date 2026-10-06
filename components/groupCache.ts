import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * In-memory high performance cache for groups with persistent storage.
 * Enables 0ms instantaneous rendering when switching tabs and tapping groups.
 */
const groupCache = new Map<number, any>();

let cachedAllGroups: any[] | null = null;
let cachedMyGroups: any[] | null = null;
let cachedJoinedGroupIds: number[] | null = null;
let cachedSavedGroupIds: number[] | null = null;

const STORAGE_KEY_ALL = "hive_cached_all_groups";
const STORAGE_KEY_MY = "hive_cached_my_groups";
const STORAGE_KEY_JOINED = "hive_cached_joined_ids";
const STORAGE_KEY_SAVED = "hive_cached_saved_ids";

export const initGroupCacheFromStorage = async () => {
  try {
    const [allRaw, myRaw, joinedRaw, savedRaw] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_ALL).catch(() => null),
      AsyncStorage.getItem(STORAGE_KEY_MY).catch(() => null),
      AsyncStorage.getItem(STORAGE_KEY_JOINED).catch(() => null),
      AsyncStorage.getItem(STORAGE_KEY_SAVED).catch(() => null),
    ]);
    if (allRaw) {
      const parsed = JSON.parse(allRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedAllGroups = parsed;
        setCachedGroups(parsed);
      }
    }
    if (myRaw) {
      const parsed = JSON.parse(myRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedMyGroups = parsed;
        setCachedGroups(parsed);
      }
    }
    if (joinedRaw) {
      const parsed = JSON.parse(joinedRaw);
      if (Array.isArray(parsed)) cachedJoinedGroupIds = parsed;
    }
    if (savedRaw) {
      const parsed = JSON.parse(savedRaw);
      if (Array.isArray(parsed)) cachedSavedGroupIds = parsed;
    }
  } catch (err) {
    console.log("Error restoring group cache:", err);
  }
};

// Eagerly restore cache
initGroupCacheFromStorage();

export const setCachedGroup = (group: any) => {
  if (group && group.id) {
    const id = Number(group.id);
    const existing = groupCache.get(id) || {};
    groupCache.set(id, { ...existing, ...group });
  }
};

export const setCachedGroups = (groups: any[]) => {
  if (Array.isArray(groups)) {
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g && g.id) {
        setCachedGroup(g);
      }
    }
  }
};

export const getCachedGroup = (groupId: number | string | undefined | null) => {
  if (!groupId) return null;
  return groupCache.get(Number(groupId)) || null;
};

// --- All Groups Cache ---
export const setCachedAllGroups = (groups: any[]) => {
  if (Array.isArray(groups) && groups.length > 0) {
    cachedAllGroups = groups;
    setCachedGroups(groups);
    AsyncStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(groups)).catch(() => {});
  }
};

export const getCachedAllGroups = (): any[] | null => {
  return cachedAllGroups;
};

// --- My (Joined) Groups Cache ---
export const setCachedMyGroups = (groups: any[]) => {
  if (Array.isArray(groups)) {
    cachedMyGroups = groups;
    setCachedGroups(groups);
    const ids = groups.map((g) => g.id);
    setCachedJoinedGroupIds(ids);
    AsyncStorage.setItem(STORAGE_KEY_MY, JSON.stringify(groups)).catch(() => {});
  }
};

export const getCachedMyGroups = (): any[] | null => {
  return cachedMyGroups;
};

// --- Joined Group IDs Cache ---
export const setCachedJoinedGroupIds = (ids: number[]) => {
  if (Array.isArray(ids)) {
    cachedJoinedGroupIds = ids;
    AsyncStorage.setItem(STORAGE_KEY_JOINED, JSON.stringify(ids)).catch(() => {});
  }
};

export const getCachedMyGroupIds = (): number[] | null => {
  return cachedJoinedGroupIds;
};

// --- Saved Group IDs Cache ---
export const setCachedSavedGroupIds = (ids: number[]) => {
  if (Array.isArray(ids)) {
    cachedSavedGroupIds = ids;
    AsyncStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(ids)).catch(() => {});
  }
};

export const getCachedSavedGroupIds = (): number[] | null => {
  return cachedSavedGroupIds;
};

export const clearGroupCache = () => {
  groupCache.clear();
  cachedAllGroups = null;
  cachedMyGroups = null;
  cachedJoinedGroupIds = null;
  cachedSavedGroupIds = null;
};
