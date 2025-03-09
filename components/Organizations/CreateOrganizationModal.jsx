"use client";

import { useState } from "react";

export default function CreateOrganizationModal({ onClose, onCreate }) {
  const [organizationName, setOrganizationName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!organizationName.trim()) {
      alert("Please enter an organization name.");
      return;
    }
    onCreate(organizationName);
  };

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
      <div className="card-sm">
        <h2 className="text-xl font-bold mb-4">Create New Organization</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Organization Name
            </label>
            <input
              type="text"
              id="name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}