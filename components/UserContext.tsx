import React, { createContext, useContext, useState } from 'react';

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
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  getInitials: () => string;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  getInitials: () => 'U',
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <UserContext.Provider value={{ user, setUser, getInitials }}>
      {children}
    </UserContext.Provider>
  );
}