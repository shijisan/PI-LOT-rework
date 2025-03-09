"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AddMemberModal from "@/components/Organizations/AddMemberModal";
import EditMemberModal from "@/components/members/EditMemberModal";
import DeleteMemberModal from "@/components/members/DeleteMemberModal";
import { use } from "react";

export default function Organization({ params }) {
  const [organization, setOrganization] = useState(null);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const orgId = use(params).orgId;

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch organization data");
          return;
        }

        setOrganization(data.organization);
      } catch (error) {
        console.error("Error fetching organization data:", error);
        setError("An unexpected error occurred");
      }
    };

    fetchOrganizationData();
  }, [orgId]);

  // Get the current user's role in the organization
  const currentUserRole = organization?.members.find(
    (member) => member.user.email === organization.owner.email // Assuming the owner's email is the logged-in user
  )?.role;

  const handleAddMemberSubmit = async ({ email, role }) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add member");
        return;
      }

      setOrganization((prev) => ({
        ...prev,
        members: [...prev.members, data.member],
      }));
    } catch (error) {
      console.error("Error adding member:", error);
      setError("An unexpected error occurred");
    }
  };

  const handleEditMemberSubmit = async ({ memberId, role }) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update member");
        return;
      }

      setOrganization((prev) => ({
        ...prev,
        members: prev.members.map((member) =>
          member.id === memberId ? { ...member, role } : member
        ),
      }));
    } catch (error) {
      console.error("Error updating member:", error);
      setError("An unexpected error occurred");
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/members/${memberId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete member");
        return;
      }

      setOrganization((prev) => ({
        ...prev,
        members: prev.members.filter((member) => member.id !== memberId),
      }));
    } catch (error) {
      console.error("Error deleting member:", error);
      setError("An unexpected error occurred");
    }
  };

  return (
    <>
      <main className="md:max-w-[90vw] w-full mx-auto pt-[10vh] flex min-h-screen">
        <div className="flex flex-row flex-grow w-full py-[5vh] gap-4">
          <Sidebar />
          <div className="w-5/6 card-lg">
            <div className="pb-1 border-b border-black/20 mb-1 px-8 pt-8">
              <h1 className="text-3xl">Organization Info</h1>
            </div>
            <div className="p-8">
              {error ? (
                <h1 className="text-red-500">{error}</h1>
              ) : organization ? (
                <>
                  <h2 className="text-2xl font-bold">{organization.name}</h2>
                  <p>Owner: {organization.owner.email}</p>
                  <h3 className="mt-4 text-xl">Members:</h3>
                  <ul>
                    <li
                      className="text-blue-500 cursor-pointer hover:underline"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      Add member
                    </li>
                    {organization.members.map((member) => (
                      <li key={member.id} className="flex items-center gap-2 mt-2">
                        <span>{member.user.email}</span>
                        <span className="text-sm text-gray-500">({member.role})</span>
                        <button
                          className="text-blue-500 ml-2 hover:underline"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 ml-2 hover:underline"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <h1>Loading...</h1>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddMemberSubmit}
        />
        <EditMemberModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditMemberSubmit}
          member={selectedMember}
          userRole={currentUserRole} // Pass the logged-in user's role
        />
        <DeleteMemberModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteMember}
          member={selectedMember}
        />
      </main>
    </>
  );
}