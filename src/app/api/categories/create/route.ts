import { getServerSession } from "next-auth/next"; // Function to get the server session for authentication
import { NextRequest, NextResponse } from "next/server"; // Next.js request and response objects

import { authOptions } from "@/lib/auth"; // Authentication options for NextAuth
import { Category } from "@/lib/db/models"; // MongoDB model for Category
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB

// Handler for POST request to create a new category
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

    // Parse the category name from the request body
    const { name } = await req.json();

    // If the category name is missing, return an error
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

    // Create a new category in the database
    const newCategory = new Category({ name });
    await newCategory.save();

    // Return a success response with the new category data
    return NextResponse.json(
      { message: "Category created successfully", category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error); // Log any error encountered
    // Return a 500 error response if creating the category fails
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}
