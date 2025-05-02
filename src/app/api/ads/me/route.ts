import { NextResponse } from "next/server"; // Next.js response object
import { getServerSession } from "next-auth/next"; // Function to get the server session for authentication

import { Ad } from "@/lib/db/models"; // MongoDB model for ads
import { authOptions } from "@/lib/auth"; // Authentication options
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB

// Handler for GET request to fetch ads created by the current user
export async function GET() {
  try {
    // Retrieve the current session to ensure the user is authenticated
    const session = await getServerSession(authOptions);

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Fetch all ads created by the current user, populate category and subcategory names,
    // and sort them by creation date in descending order
    const userAds = await Ad.find({ user: session.user.id })
      .populate("category", "name") // Populate category with only the 'name' field
      .populate("subcategory", "name") // Populate subcategory with only the 'name' field
      .sort({ createdAt: -1 }) // Sort ads by creation date in descending order
      .lean(); // Return plain JavaScript objects (not Mongoose documents)

    // Return the list of user's ads as JSON
    return NextResponse.json(userAds);
  } catch (error) {
    console.error("Error fetching user ads:", error); // Log any error encountered
    // Return a 500 error response if fetching the ads fails
    return NextResponse.json(
      { message: "Failed to fetch ads" },
      { status: 500 }
    );
  }
}
