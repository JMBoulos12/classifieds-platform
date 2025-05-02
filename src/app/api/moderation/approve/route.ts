import { getServerSession } from "next-auth/next"; // Function to get the server session for authentication
import { NextRequest, NextResponse } from "next/server"; // Next.js request and response objects

import { authOptions } from "@/lib/auth"; // Authentication options for NextAuth
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB
import { Ad, ModerationRecord } from "@/lib/db/models"; // MongoDB models for Ad and ModerationRecord

// Handler for POST request to approve an ad
export async function POST(req: NextRequest) {
  try {
    // Retrieve the current session to check if the user is a moderator
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has the 'moderator' role
    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Parse the request body to extract the adId
    const body = await req.json();
    const { adId } = body;

    // If the adId is missing, return an error response
    if (!adId) {
      return NextResponse.json(
        { message: "Ad ID is required" },
        { status: 400 }
      );
    }

    // Find the ad in the database by its ID
    const ad = await Ad.findById(adId);

    // If the ad is not found, return an error response
    if (!ad) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    // Update the ad's status to "approved"
    ad.status = "approved";
    await ad.save();

    // Create a new moderation record to log the approval action
    const moderationRecord = new ModerationRecord({
      ad: adId,
      moderator: session.user.id,
      status: "approved",
    });

    // Save the moderation record to the database
    await moderationRecord.save();

    // Return a success response
    return NextResponse.json(
      { message: "Ad approved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving ad:", error); // Log any errors encountered
    // Return a 500 error response if the approval fails
    return NextResponse.json(
      { message: "Failed to approve ad" },
      { status: 500 }
    );
  }
}
