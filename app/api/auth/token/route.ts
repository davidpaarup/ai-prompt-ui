import { auth } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return Response.json({ 
      token: session.session.token 
    });
  } catch (error) {
    console.error("Error getting session token:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}