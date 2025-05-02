import { getServerSession } from "next-auth/next"; // Function to retrieve session data from NextAuth
import { NextRequest, NextResponse } from "next/server"; // Next.js server request and response objects

import { authOptions } from "@/lib/auth"; // Authentication options for NextAuth
import { connectToMongoDB } from "@/lib/db/mongodb"; // MongoDB connection utility
import { Category, Subcategory } from "@/lib/db/models"; // MongoDB Category and Subcategory models

// Handler for PUT request to update an existing category
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Retrieve the current session data from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has the 'moderator' role
    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB database
    await connectToMongoDB();

    // Extract the category ID from the URL parameters
    const { id } = await context.params;
    const categoryId = id;

    // Parse the request body to extract the new category name
    const { name } = await req.json();

    // Validate the category name
    if (!name) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 }
      );
    }

    // Find the category by its ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if a category with the same name already exists (excluding the current category)
    const existingCategory = await Category.findOne({
      name,
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      return NextResponse.json(
        { message: "A category with this name already exists" },
        { status: 409 }
      );
    }

    // Update the category with the new name
    await Category.findByIdAndUpdate(categoryId, { name });

    return NextResponse.json(
      { message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error); // Log any errors for debugging
    // Return a 500 error response if something goes wrong
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}

// Handler for DELETE request to remove an existing category
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Retrieve the current session data from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and has the 'moderator' role
    if (!session?.user || session.user.role !== "moderator") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB database
    await connectToMongoDB();

    // Extract the category ID from the URL parameters
    const { id } = await context.params;
    const categoryId = id;

    // Find the category by its ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Delete all subcategories associated with the category
    await Subcategory.deleteMany({ category: categoryId });

    // Delete the category itself
    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json(
      { message: "Category and its subcategories deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error); // Log any errors for debugging
    // Return a 500 error response if something goes wrong
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
