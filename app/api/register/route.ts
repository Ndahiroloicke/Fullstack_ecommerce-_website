import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    const user = await (await clerkClient()).users.createUser({
      emailAddress: email,
      password,
      firstName: name,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log('[REGISTER_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }  
} 