"use client";

export interface AuthContextProps {
  children: React.ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProps) {
  return <>{children}</>;
}