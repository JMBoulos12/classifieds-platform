"use client"; // Marks this component to be rendered on the client side

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Next.js navigation hook
import { useSession } from "next-auth/react"; // Hook to access authentication session data

// Component to protect routes that require authentication (and optionally a "moderator" role)
export default function RequireAuth({
  children, // The component(s) to render if authenticated
  moderatorRequired = false, // Optional flag to restrict access to moderators only
}: {
  children: React.ReactNode;
  moderatorRequired?: boolean;
}) {
  const { data: session, status } = useSession(); // Get session data and auth status
  const router = useRouter(); // Initialize router for client-side navigation

  useEffect(() => {
    if (status === "loading") return; // Don't redirect while checking auth status

    // Redirect to login if not authenticated
    if (!session) {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(
          window.location.pathname
        )}`
      );
    }
    // If moderator access is required and user is not a moderator, redirect to home
    else if (moderatorRequired && session.user.role !== "moderator") {
      router.push("/");
    }
  }, [session, status, router, moderatorRequired]); // Re-run effect on session/status/role changes

  // Show a loading spinner while the session is loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render children if authenticated and (if required) user is a moderator
  if (
    status === "authenticated" &&
    (!moderatorRequired || session.user.role === "moderator")
  ) {
    return <>{children}</>;
  }

  // Return null if unauthorized or while redirection happens
  return null;
}
