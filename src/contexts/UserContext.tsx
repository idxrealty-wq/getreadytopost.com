"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/profile";
import type { UserProfile } from "@/types/user";

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, loading }}>
      {children}
    </UserContext.Provider>
  );
}
