"use client";

import { useState, useEffect } from "react";

export default function EditMemberModal({ isOpen, onClose, onSubmit, member, userRole }) {
  // Initialize the role state with the member's current role
  const [role, setRole] = useState(member?.role || "MEMBER");

  // Reset the role state whenever the modal is opened or the member changes
  useEffect(() => {
    if (isOpen && member) {
      setRole(member.role || "MEMBER");
    }
  }, [isOpen, member]);

  // If the modal is not open or member is not defined, do not render anything
  if (!isOpen || !member) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit({ memberId: member.id, role });
    onClose(); // Close the modal after submission
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
      <div className="card-sm bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={role} // Bind the select input to the role state
              onChange={(e) => setRole(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="MODERATOR">Moderator</option>
              {/* Show OWNER option only if the selected member already has the OWNER role */}
              {member.role === "OWNER" && <option value="OWNER">Owner</option>}
            </select>
          </div>
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
              className="btn-secondary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}