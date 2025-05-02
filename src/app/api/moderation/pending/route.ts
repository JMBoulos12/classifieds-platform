import { NextResponse } from "next/server"; // Next.js response object
import { getServerSession } from "next-auth"; // Function to get the server session for authentication

import { Ad } from "@/lib/db/models"; // MongoDB model for Ad
import { authOptions } from "@/lib/auth"; // Authentication options for NextAuth
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB

// Handler for GET request to fetch pending ads
export async function GET() {
  try {
    // Retrieve the current session to check if the user is a moderator
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has the 'moderator' role
    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Find all ads with a status of "pending" and populate related fields (user, category, subcategory)
    const pendingAds = await Ad.find({ status: "pending" })
      .populate("user", "name") // Populate the user field with the user's name
      .populate("category", "name") // Populate the category field with the category's name
      .populate("subcategory", "name") // Populate the subcategory field with the subcategory's name
      .sort({ createdAt: -1 }) // Sort ads by creation date in descending order
      .lean(); // Return plain JavaScript objects instead of Mongoose documents

    // Return the list of pending ads
    return NextResponse.json(pendingAds);
  } catch (error) {
    console.error("Error fetching pending ads:", error); // Log any errors encountered
    // Return a 500 error response if there is a failure in fetching the pending ads
    return NextResponse.json(
      { message: "Failed to fetch pending ads" },
      { status: 500 }
    );
  }
}
