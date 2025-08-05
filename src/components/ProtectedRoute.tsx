import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/pages/_app";

/**
 * Higher order component that redirects unauthenticated users to /login.  It can
 * also restrict access based on role by passing an array of allowed roles.
 */
interface Props {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, role } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (allowedRoles && role && !allowedRoles.includes(role)) {
      // redirect to home if user does not have access
      router.replace("/");
    }
  }, [user, role, allowedRoles, router]);

  if (!user) return null; // prevent flicker
  if (allowedRoles && role && !allowedRoles.includes(role)) return null;
  return <>{children}</>;
}
