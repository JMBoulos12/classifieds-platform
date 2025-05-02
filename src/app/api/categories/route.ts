import { NextResponse } from "next/server"; // Next.js response object

import { Category } from "@/lib/db/models"; // MongoDB model for categories
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB

// Handler for GET request to fetch all categories
export async function GET() {
  try {
    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Fetch all categories from the database, sorted by name in ascending order
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Return the list of categories as JSON
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error); // Log any error encountered
    // Return a 500 error response if fetching categories fails
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
