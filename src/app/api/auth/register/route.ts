import bcrypt from "bcrypt"; // Library for hashing passwords
import { NextRequest, NextResponse } from "next/server"; // Next.js request and response objects

import { User } from "@/lib/db/models"; // MongoDB model for the user
import { connectToMongoDB } from "@/lib/db/mongodb"; // Function to connect to MongoDB

// Handler for POST request to register a new user
export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body of the request
    const body = await req.json();
    const { name, email, password } = body;

    // Check if any required fields are missing
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Establish a connection to MongoDB
    await connectToMongoDB();

    // Check if a user already exists with the provided email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Hash the provided password using bcrypt with a salt round of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object with the hashed password and a default role of 'user'
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user", // Default role for new users
    });

    // Save the new user to the database
    await newUser.save();

    // Return a success response with the user details (excluding the password)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error); // Log any error encountered
    // Return a 500 error response if there is a server error
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
