import { authOptions } from "@/lib/auth"; // Authentication options for NextAuth
import NextAuth from "next-auth/next"; // NextAuth function to handle authentication

// Initialize NextAuth with the provided authentication options
const handler = NextAuth(authOptions);

// Export handler to handle both GET and POST requests for authentication
export { handler as GET, handler as POST };
