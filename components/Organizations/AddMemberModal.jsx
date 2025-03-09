"use client";

import { useState } from "react";

export default function AddMemberModal({ isOpen, onClose, onSubmit }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit({ email, role });
    setEmail(""); // Reset the form fields
    setRole("MEMBER");
    onClose(); // Close the modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
      <div className="card-sm bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
            >
              <option value="MEMBER">Member</option>
              <option value="MODERATOR">Moderator</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-dead"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 btn-secondary"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}