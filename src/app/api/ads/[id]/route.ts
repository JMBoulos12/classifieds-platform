import { uploadImage } from "@/lib/cloudinary"; // Function to upload images to Cloudinary
import { getServerSession } from "next-auth/next"; // Function to get the server session for authentication
import { NextRequest, NextResponse } from "next/server"; // Next.js request and response objects

import { Ad } from "@/lib/db/models"; // MongoDB model for ads
import { authOptions } from "@/lib/auth"; // Authentication options
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB

// Handler for GET request to fetch an ad by ID
export async function GET(
  req: NextRequest, // The incoming HTTP request
  context: { params: Promise<{ id: string }> } // Context containing route parameters (ad ID)
) {
  try {
    const { id } = await context.params; // Extract the ad ID from the route parameters
    await connectToMongoDB(); // Establish a connection to MongoDB

    // Fetch the ad from the database and populate related category and subcategory data
    const ad = await Ad.findById(id)
      .populate("category")
      .populate("subcategory")
      .lean();

    // If ad is not found, return a 404 response
    if (!ad) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    // Return the found ad as JSON
    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error); // Log any error encountered
    // Return a 500 error response if fetching the ad fails
    return NextResponse.json(
      { message: "Failed to fetch ad" },
      { status: 500 }
    );
  }
}

// Handler for PUT request to update an ad
export async function PUT(
  req: NextRequest, // The incoming HTTP request
  context: { params: Promise<{ id: string }> } // Context containing route parameters (ad ID)
) {
  try {
    const session = await getServerSession(authOptions); // Get the current session for authentication
    const { id } = await context.params; // Extract the ad ID from the route parameters

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB(); // Establish a connection to MongoDB

    // Fetch the existing ad from the database
    const existingAd = await Ad.findById(id);

    // If the ad is not found, return a 404 response
    if (!existingAd) {
      return NextResponse.json({ message: "Ad not found" }, { status: 404 });
    }

    // Check if the logged-in user is the owner of the ad
    if (existingAd.user.toString() !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse form data from the incoming request
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const existingImages = JSON.parse(
      (formData.get("existingImages") as string) || "[]"
    );

    // Validate required fields
    if (
      !title ||
      !description ||
      isNaN(price) ||
      !category ||
      !subcategory ||
      !city ||
      !country
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get image files from the form data
    const imageFiles = formData.getAll("images") as File[];
    const images = existingImages || [];

    // If there are new images, upload them and add to the images array
    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const buffer = await imageFile.arrayBuffer(); // Convert image to buffer
        const imageUrl = await uploadImage(buffer); // Upload image to Cloudinary
        images.push(imageUrl); // Add image URL to the images array
      }
    }

    // Update the ad in the database with new information
    const updatedAd = await Ad.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price,
        category,
        subcategory,
        location: {
          city,
          country,
        },
        images,
        status: "pending", // Reset the ad status to "pending" for moderation
        rejectionReason: undefined, // Clear any rejection reason
      },
      { new: true } // Return the updated ad
    );

    // Return a success response with the updated ad
    return NextResponse.json({
      message: "Ad updated successfully and pending approval",
      ad: updatedAd,
    });
  } catch (error) {
    console.error("Error updating ad:", error); // Log any error encountered
    // Return a 500 error response if updating the ad fails
    return NextResponse.json(
      { message: "Failed to update ad" },
      { status: 500 }
    );
  }
}
