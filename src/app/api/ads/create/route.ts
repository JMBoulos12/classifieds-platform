import { uploadImage } from "@/lib/cloudinary"; // Function to upload images to Cloudinary
import { getServerSession } from "next-auth/next"; // Function to get the server session for authentication
import { NextRequest, NextResponse } from "next/server"; // Next.js request and response objects

import { Ad } from "@/lib/db/models"; // MongoDB model for ads
import { authOptions } from "@/lib/auth"; // Authentication options
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB

// Handler for POST request to create a new ad
export async function POST(req: NextRequest) {
  try {
    // Retrieve the current session to ensure the user is authenticated
    const session = await getServerSession(authOptions);

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Parse the form data from the request
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;

    // Validate the required fields
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

    // Get the images from the form data
    const imageFiles = formData.getAll("images") as File[];
    const images: string[] = [];

    // Upload images to Cloudinary if any are provided
    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const buffer = await imageFile.arrayBuffer(); // Convert image to buffer
        const imageUrl = await uploadImage(buffer); // Upload image to Cloudinary
        images.push(imageUrl); // Add image URL to the images array
      }
    }

    // Create a new ad object
    const newAd = new Ad({
      title,
      description,
      price,
      category,
      subcategory,
      location: {
        city,
        country,
      },
      user: session.user.id, // Assign the current user's ID as the ad's owner
      images,
    });

    // Save the new ad to the database
    await newAd.save();

    // Return a success response with the new ad's ID
    return NextResponse.json(
      {
        message: "Ad created successfully and pending approval",
        adId: newAd._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ad:", error); // Log any error encountered
    // Return a 500 error response if creating the ad fails
    return NextResponse.json(
      { message: "Failed to create ad" },
      { status: 500 }
    );
  }
}
