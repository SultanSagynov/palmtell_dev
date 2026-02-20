import { NextRequest, NextResponse } from "next/server";
import { createPalmSession } from "@/lib/session-storage";
import { validatePalmImage } from "@/lib/palm-validation";
import { uploadToR2 } from "@/lib/r2";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const dob = formData.get('dob') as string;

    if (!image || !dob) {
      return NextResponse.json(
        { error: "Image and date of birth are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Please upload a valid image file" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file is too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Generate session token and upload to temp location
    const sessionToken = crypto.randomUUID();
    const tempKey = `temp/${sessionToken}/palm.jpg`;
    
    // Convert File to Buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to R2
    const imageUrl = await uploadToR2(buffer, tempKey, image.type);
    
    // Create session in Redis
    const createdSessionToken = await createPalmSession(tempKey, dob);
    
    // Set session cookie
    const response = NextResponse.json({ 
      sessionToken: createdSessionToken,
      imageUrl 
    });
    
    response.cookies.set('palm_session', createdSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600 // 1 hour
    });

    return response;
  } catch (error) {
    console.error("Palm submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit palm data" },
      { status: 500 }
    );
  }
}
