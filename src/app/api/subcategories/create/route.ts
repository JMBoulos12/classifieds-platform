import { getServerSession } from "next-auth/next"; // Function to retrieve session data from NextAuth
import { NextRequest, NextResponse } from "next/server"; // Next.js server request and response objects

import { authOptions } from "@/lib/auth"; // Authentication options for NextAuth
import { Category } from "@/lib/db/models"; // MongoDB Category model
import { connectToMongoDB } from "@/lib/db/mongodb"; // MongoDB connection utility

// Handler for POST request to create a new category
export async function POST(req: NextRequest) {
  try {
    // Retrieve the current session data from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has the 'moderator' role
    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to the MongoDB database
    await connectToMongoDB();

    // Parse the JSON request body to extract the category name
    const { name } = await req.json();

    // Validate the category name
    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    // Create a new category with the provided name
    const newCategory = new Category({ name });
    await newCategory.save();

    // Return a success response with the new category data
    return NextResponse.json(
      { message: "Category created successfully", category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error); // Log any errors for debugging
    // Return a 500 error response if something goes wrong
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}
