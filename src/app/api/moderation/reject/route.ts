import { getServerSession } from "next-auth"; // Function to retrieve the session of the current user
import { NextRequest, NextResponse } from "next/server"; // Next.js response and request objects

import { authOptions } from "@/lib/auth"; // Authentication options for NextAuth
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB
import { Ad, ModerationRecord } from "@/lib/db/models"; // MongoDB models for Ad and ModerationRecord

// Handler for POST request to reject an ad
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

    // Parse the incoming request body
    const body = await req.json();
    const { adId, reason } = body;

    // Validate the required fields (adId and reason)
    if (!adId || !reason) {
      return NextResponse.json(
        { message: "Ad ID and reason are required" },
        { status: 400 }
      );
    }

    // Find the ad by its ID
    const ad = await Ad.findById(adId);

    // If the ad does not exist, return a 404 error
    if (!ad) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    // Update the ad's status to 'rejected' and store the rejection reason
    ad.status = "rejected";
    ad.rejectionReason = reason;
    await ad.save();

    // Create a new moderation record to log the rejection
    const moderationRecord = new ModerationRecord({
      ad: adId,
      moderator: session.user.id,
      status: "rejected",
      reason,
    });

    // Save the moderation record
    await moderationRecord.save();

    // Return a success message indicating that the ad has been rejected
    return NextResponse.json(
      { message: "Ad rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting ad:", error); // Log the error for debugging
    // Return a 500 error response if there is an issue with the rejection process
    return NextResponse.json(
      { message: "Failed to reject ad" },
      { status: 500 }
    );
  }
}
