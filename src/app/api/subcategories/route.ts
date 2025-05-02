import { NextResponse } from "next/server"; // Next.js response object

import { Category } from "@/lib/db/models"; // MongoDB model for Category
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB

// Handler for GET request to fetch all categories
export async function GET() {
  try {
    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Retrieve all categories from the database, sorted by name in ascending order
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Return the categories as a JSON response
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error); // Log the error for debugging
    // Return a 500 error response if there is an issue fetching categories
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
