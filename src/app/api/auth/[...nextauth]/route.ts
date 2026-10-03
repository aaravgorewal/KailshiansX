// src/app/api/auth/[...nextauth]/route.ts
// Auth.js v5 route handler — handles all /api/auth/* requests
// (sign-in, sign-out, callback, session, CSRF, email verification)

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
