import { getAuthenticatedUser } from "@/backend/auth/getAuthenticatedUser";
import { redirect } from "next/navigation";

export async function protectRoute(allowedRoles: string[] = []) {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;

  // If no specific roles required, just being authenticated is enough
  if (allowedRoles.length === 0) {
    return user;
  }

  // Check if user has one of the allowed roles
  if (!allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on their ACTUAL role
    if (role === 'student') redirect('/dashboard');
    if (role === 'teacher') redirect('/coach');
    if (role === 'parent') redirect('/research-and-development/parent/dashboard');
    if (role === 'admin') redirect('/dashboard');
    
    // Fallback if role is unknown or none
    redirect('/login');
  }

  return user;
}
