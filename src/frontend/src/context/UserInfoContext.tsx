import { type ReactNode, createContext, useContext, useState } from "react";

const STORAGE_KEY = "shadowmc_user_info";
// Session key: changes every browser session, forcing popup on new visits
const SESSION_KEY = "shadowmc_session_entered";

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
    // Check if user has entered in this browser session
    const sessionEntered = sessionStorage.getItem(SESSION_KEY);
    if (!sessionEntered) {
      // New session: always show the popup, but load saved username/email as defaults
      return { minecraftUsername: "", playerEmail: "", hasEnteredStore: false };
    }
    // Same session: load from localStorage
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
      // Mark that user has entered in this session
      sessionStorage.setItem(SESSION_KEY, "1");
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
      sessionStorage.removeItem(SESSION_KEY);
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
