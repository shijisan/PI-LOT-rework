"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [email, setEmail] = useState(null);
    const [error, setError] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

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

            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("An unexpected error occurred");
            }
        };

        const fetchOrganizations = async () => {
            try {
                const response = await fetch("/api/organizations");
                const data = await response.json();


                if (!response.ok) {
                    setError(data.error || "Failed to fetch organizations");
                    return;
                }

                setOrganizations(data.organizations);
            } catch (error) {
                console.error("Error fetching organizations:", error);
                setError("An unexpected error occurred");
            }
        };

        fetchUserData();
        fetchOrganizations();
    }, []);

    const handleCreateOrganization = async (organizationName) => {
        try {
            const response = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: organizationName }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to create organization");
                return;
            }

            // Add the new organization to the state
            setOrganizations((prev) => [...prev, data.organization]);
            setIsModalOpen(false); // Close the modal
        } catch (error) {
            console.error("Error creating organization:", error);
            setError("An unexpected error occurred");
        }
    };

    return (
        <>
            <main className="md:max-w-[90vw] w-full mx-auto pt-[10vh] flex min-h-screen">
                <div className="flex flex-row flex-grow w-full py-[5vh] gap-4">
                    <Sidebar />
                    <div className="w-5/6 flex flex-col card-lg">
                        <div className="pb-1 border-b border-black/20 mb-1 px-8 pt-8">
                            <h1 className="text-3xl">Organizations</h1>
                        </div>
                        <div className="p-8">
                            <div>
                                <h1>Organizations:</h1>
                                <div className="lg:grid-cols-4 md:grid-cols-4 grid-cols-1 gap-4 flex-row grid">
                                    <button
                                        className="card-sm bg-neutral-100 hover:cursor-pointer hover:brightness-105 transition-all"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        Create new organization
                                    </button>
                                    {organizations.map((org) => (
                                        <div key={org.id} className="card-sm bg-neutral-100 p-4 hover:cursor-pointer hover:brightness-105 transition-all" onClick={() => router.push(`/organization/${org.organization.id}`)} >
                                            <h2>{org.organization.name}</h2>
                                            <p>Role: {org.role}</p>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Organization Modal */}
            {isModalOpen && (
                <CreateOrganizationModal
                    onClose={() => setIsModalOpen(false)}
                    onCreate={handleCreateOrganization}
                />
            )}
        </>
    );
}