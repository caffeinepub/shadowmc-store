import { type ReactNode, createContext, useContext, useState } from "react";

const STORAGE_KEY = "shadowmc_user_info";

interface UserInfo {
  minecraftUsername: string;
  playerEmail: string;
  hasEnteredStore: boolean;
}

interface UserInfoContextType {
  userInfo: UserInfo;
  setUserInfo: (username: string, email: string) => void;
  clearUserInfo: () => void;
}

function loadFromStorage(): UserInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserInfo;
      if (parsed.minecraftUsername && parsed.playerEmail) {
        return { ...parsed, hasEnteredStore: true };
      }
    }
  } catch {
    // ignore
  }
  return { minecraftUsername: "", playerEmail: "", hasEnteredStore: false };
}

const UserInfoContext = createContext<UserInfoContextType | null>(null);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfoState] = useState<UserInfo>(loadFromStorage);

  const setUserInfo = (username: string, email: string) => {
    const info: UserInfo = {
      minecraftUsername: username,
      playerEmail: email,
      hasEnteredStore: true,
    };
    setUserInfoState(info);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch {
      // ignore storage errors
    }
  };

  const clearUserInfo = () => {
    const empty: UserInfo = {
      minecraftUsername: "",
      playerEmail: "",
      hasEnteredStore: false,
    };
    setUserInfoState(empty);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <UserInfoContext.Provider value={{ userInfo, setUserInfo, clearUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfo() {
  const ctx = useContext(UserInfoContext);
  if (!ctx) throw new Error("useUserInfo must be used within UserInfoProvider");
  return ctx;
}
