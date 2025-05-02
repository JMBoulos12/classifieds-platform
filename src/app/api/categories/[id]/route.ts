import { getServerSession } from "next-auth/next"; // Function to get the server session for authentication
import { NextRequest, NextResponse } from "next/server"; // Next.js request and response objects

import { authOptions } from "@/lib/auth"; // Authentication options for NextAuth
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB
import { Category, Subcategory } from "@/lib/db/models"; // MongoDB models for Category and Subcategory

// Handler for PUT request to update a category
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Retrieve the current session to check if the user is a moderator
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has the 'moderator' role
    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Retrieve the category ID from the URL parameters
    const { id } = await context.params;
    const categoryId = id;

    // Parse the category name from the request body
    const { name } = await req.json();

    // If the category name is missing, return an error
    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if another category already exists with the same name
    const existingCategory = await Category.findOne({
      name,
      _id: { $ne: categoryId }, // Exclude the current category from the check
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "A category with this name already exists" },
        { status: 409 }
      );
    }

    // Update the category with the new name
    await Category.findByIdAndUpdate(categoryId, { name });

    // Return a success response
    return NextResponse.json(
      { message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error); // Log any error encountered
    // Return a 500 error response if updating the category fails
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Handler for DELETE request to delete a category
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Retrieve the current session to check if the user is a moderator
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has the 'moderator' role
    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Retrieve the category ID from the URL parameters
    const { id } = await context.params;
    const categoryId = id;

    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Delete all subcategories that belong to the category
    await Subcategory.deleteMany({ category: categoryId });

    // Delete the category from the database
    await Category.findByIdAndDelete(categoryId);

    // Return a success response
    return NextResponse.json(
      { message: "Category and its subcategories deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error); // Log any error encountered
    // Return a 500 error response if deleting the category fails
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
