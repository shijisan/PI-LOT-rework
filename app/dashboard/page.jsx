"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Logout from "@/components/Logout";

export default function Dashboard() {
  const [email, setEmail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data from the API
        const response = await fetch("/api/dashboard");
        const data = await response.json();

        // Handle errors
        if (!response.ok) {
          setError(data.error || "Failed to fetch user data");
          return;
        }

        // Extract the email from the user object
        const userEmail = data.user?.email;

        // Set the email state
        if (userEmail) {
          setEmail(userEmail);
        } else {
          setError("User email not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("An unexpected error occurred");
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <main className="md:max-w-[90vw] w-full mx-auto pt-[10vh] flex min-h-screen">
        <div className="flex flex-row flex-grow w-full py-[5vh] gap-4">
          <Sidebar />
          <div className="w-5/6 flex flex-col card-lg">
            <div className="pb-1 border-b border-black/20 mb-1 px-8 pt-8">
              <h1 className="text-3xl">User Info</h1>
            </div>
            <div className="p-8">
              {error ? (
                <h1 className="text-red-500">{error}</h1>
              ) : (
                <h1>Email: {email || "Loading..."}</h1>
              )}
              <Logout />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}