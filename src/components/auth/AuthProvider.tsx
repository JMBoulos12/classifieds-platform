"use client"; // Ensures this component is rendered on the client side in a Next.js app

import { ReactNode } from "react"; // Import type for React children
import { SessionProvider } from "next-auth/react"; // Import NextAuth.js provider for managing authentication sessions

// AuthProvider component wraps its children with NextAuth's SessionProvider
// This allows any nested component to access the user's authentication session
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>; // Provide session context to all children
}
