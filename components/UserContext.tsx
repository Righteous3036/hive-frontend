import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { clearToken, setToken } from "./api";

export type User = {
  id: number;
  name: string;
  email: string;
  student_id: string;
  department: string;
  level: string;
  role: string;
  profile_color: string;
  profile_picture: string | null;
  cover_photo: string | null;
  bio: string;
  token?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  getInitials: () => string;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  getInitials: () => "U",
});

export const useUser = () => useContext(UserContext);

export const getStoredUser = async (): Promise<User | null> => {
  try {
    const raw = await AsyncStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUserState] = useState<User | null>(initialUser ?? null);

  useEffect(() => {
    if (!user) {
      // Hydrate cached user from AsyncStorage if not already passed via prop
      getStoredUser().then((stored) => {
        if (stored) {
          setUserState((prev) => prev || stored);
        }
      });
    }
  }, []);


  const setUser = (newUser: User | null) => {
    if (newUser?.token) {
      setToken(newUser.token);
    } else if (!newUser) {
      clearToken();
    }

    if (newUser) {
      void AsyncStorage.setItem("auth_user", JSON.stringify(newUser));
    } else {
      void AsyncStorage.removeItem("auth_user");
    }

    setUserState(newUser);
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <UserContext.Provider value={{ user, setUser, getInitials }}>
      {children}
    </UserContext.Provider>
  );
}

