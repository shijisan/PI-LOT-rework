"use client";

import { useState, useEffect } from "react";

export default function EditChatroomModal({ onClose, onSave, orgId, chatRoom }) {
  const [name, setName] = useState(chatRoom?.name || "");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/members`);
        const data = await response.json();

        if (!response.ok) {
          console.error(data.error || "Failed to fetch members");
          return;
        }

        setMembers(data.members);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [orgId]);

  useEffect(() => {
    if (chatRoom) {
      setName(chatRoom.name);
      setSelectedMembers(chatRoom.access.map((access) => access.member.id));
    }
  }, [chatRoom]);

  const handleMemberToggle = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || selectedMembers.length === 0) {
      alert("Please provide a name and select at least one member.");
      return;
    }

    await onSave(name, selectedMembers);
    onClose();
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-xl font-bold mb-4">Edit Chat Room</h2>
        <form onSubmit={handleSubmit}>
          {/* Input for Chat Room Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
            />
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Members
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
            />
          </div>

          {/* Member List with Checkboxes */}
          <div className="mb-4 max-h-48 overflow-y-auto">
            {loading ? (
              <p className="text-sm text-gray-500">Loading members...</p>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id={member.id}
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    className="btn-secondary"
                  />
                  <label htmlFor={member.id} className="text-sm text-gray-700">
                    {member.name}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No members found.</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}