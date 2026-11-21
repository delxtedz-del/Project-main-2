import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = (await request.json()) as { token?: string };

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    // ถ้าไม่มี Secret Key หรืออยู่ใน dev environment ให้ pass ได้
    if (!secretKey) {
      return NextResponse.json({ success: true });
    }

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const outcome = (await result.json()) as { success?: boolean };

    if (outcome.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: "Verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
