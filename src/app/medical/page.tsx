"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MedicalRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
