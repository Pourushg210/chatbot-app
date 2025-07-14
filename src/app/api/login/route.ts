import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = "your_jwt_secret";

// Mock users
const users = [
  { username: "admin", password: "adminpass", role: "admin" },
  { username: "user", password: "userpass", role: "user" },
];

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = jwt.sign({ username: user.username, role: user.role }, SECRET, {
    expiresIn: "1h",
  });
  return NextResponse.json({ token, role: user.role });
}
