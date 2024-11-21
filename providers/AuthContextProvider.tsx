"use client";

import { ClerkProvider } from "@clerk/nextjs";

export interface AuthContextProps {
  children: React.ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProps) {
  return <ClerkProvider>{children}</ClerkProvider>;
}