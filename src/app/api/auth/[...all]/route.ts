import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// Ingreso, salida, sesión y contraseñas del panel (lo llama el cliente de Better Auth)
export const GET = (request: Request) => toNextJsHandler(getAuth()).GET(request);
export const POST = (request: Request) => toNextJsHandler(getAuth()).POST(request);
