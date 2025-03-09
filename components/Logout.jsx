"use client";

import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Send a POST request to the logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Check if the logout was successful
      if (response.ok) {
        // Redirect to the login page or home page
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button className="btn-destructive" onClick={handleLogout}>
      Log Out
    </button>
  );
}