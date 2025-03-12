"use client";

import { useState, useEffect } from "react";

export default function CreateChatroomModal({ onClose, onCreate, orgId }) {
  const [name, setName] = useState(""); // State for the chat room name
  const [selectedMembers, setSelectedMembers] = useState([]); // State for selected member IDs
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query
  const [members, setMembers] = useState([]); // State for the list of members
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [isSubmitting, setIsSubmitting] = useState(false); // State for form submission

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/members`);
        const data = await response.json();

        if (!response.ok) {
          console.error(data.error || "Failed to fetch members");
          return;
        }

        setMembers(data.members); // Set the fetched members
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchMembers();
  }, [orgId]);

  // Handle checkbox changes
  const handleMemberToggle = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!name || selectedMembers.length === 0) {
      alert("Please provide a name and select at least one member.");
      return;
    }

    setIsSubmitting(true); // Start loading

    try {
      // Call the onCreate handler with the chat room details
      await onCreate(name, selectedMembers);

      // Reset the form and close the modal
      setName("");
      setSelectedMembers([]);
      setSearchQuery("");
      onClose();
    } catch (error) {
      console.error("Error creating chat room:", error);
      alert("Failed to create chat room. Please try again.");
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  // Filter members based on the search query
  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]" tabIndex="-1">
        <h2 id="modal-title" className="text-xl font-bold mb-4">Create Chat Room</h2>
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

          {/* Buttons for Select All and Clear Selection */}
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedMembers(members.map((member) => member.id))}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setSelectedMembers([])}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
            >
              Clear Selection
            </button>
          </div>

          {/* Selected Members Count */}
          <p className="text-sm text-gray-500 mb-4">
            {selectedMembers.length} member(s) selected
          </p>

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
                  <label
                    htmlFor={member.id}
                    className={`text-sm ${selectedMembers.includes(member.id) ? "font-bold text-blue-600" : "text-gray-700"}`}
                  >
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}