import { type ReactNode, createContext, useContext, useState } from "react";

interface UserInfo {
  minecraftUsername: string;
  playerEmail: string;
  hasEnteredStore: boolean;
}

interface UserInfoContextType {
  userInfo: UserInfo;
  setUserInfo: (username: string, email: string) => void;
}

const UserInfoContext = createContext<UserInfoContextType | null>(null);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfoState] = useState<UserInfo>({
    minecraftUsername: "",
    playerEmail: "",
    hasEnteredStore: false,
  });

  const setUserInfo = (username: string, email: string) => {
    setUserInfoState({
      minecraftUsername: username,
      playerEmail: email,
      hasEnteredStore: true,
    });
  };

  return (
    <UserInfoContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfo() {
  const ctx = useContext(UserInfoContext);
  if (!ctx) throw new Error("useUserInfo must be used within UserInfoProvider");
  return ctx;
}
