"use client";

export default function DeleteMemberModal({ isOpen, onClose, onDelete, member }) {
  const handleDelete = async () => {
    await onDelete(member.id);
    onClose(); // Close the modal after deletion
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
      <div className="card-sm bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Delete Member</h2>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete <strong>{member.user.email}</strong> from the organization?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-dead"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn-destructive"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}