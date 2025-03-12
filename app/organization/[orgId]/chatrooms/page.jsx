"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import CreateChatroomModal from "@/components/chatrooms/CreateChatroomModal";
import EditChatroomModal from "@/components/chatrooms/EditChatroomModal"; // Import Edit Modal
import DeleteChatroomModal from "@/components/chatrooms/DeleteChatroomModal"; // Import Delete Modal
import { useRouter } from "next/navigation";
import React from "react"; // Import React for use()

export default function Chatrooms({ params }) {
  const orgId = React.use(params).orgId; // Unwrap params using React.use()
  const [email, setEmail] = useState(null);
  const [error, setError] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for Edit Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for Delete Modal
  const [selectedChatRoom, setSelectedChatRoom] = useState(null); // Track the selected chat room
  const router = useRouter();

  useEffect(() => {
    if (!orgId) {
      console.error("orgId is undefined");
      setError("Invalid organization ID");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch user data");
          return;
        }

        setEmail(data.email); // Assuming the API returns the user's email
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("An unexpected error occurred");
      }
    };

    const fetchChatRooms = async () => {
      try {
        const response = await fetch(`/api/organizations/${orgId}/chatrooms`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch chat rooms");
          return;
        }

        setChatRooms(data.chatRooms);
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
        setError("An unexpected error occurred");
      }
    };

    fetchUserData();
    fetchChatRooms();
  }, [orgId]);

  const handleCreateChatroom = async (chatRoomName, memberIds) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/chatrooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: chatRoomName, memberIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create chat room");
        return;
      }

      setChatRooms((prev) => [...prev, data.chatRoom]);
      setIsCreateModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error creating chat room:", error);
      setError("An unexpected error occurred");
    }
  };

  const handleEditChatroom = async (chatRoomName, memberIds) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/chatrooms/${selectedChatRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: chatRoomName, memberIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update chat room");
        return;
      }

      // Update the chat room in the state
      setChatRooms((prev) =>
        prev.map((chatRoom) => (chatRoom.id === data.chatRoom.id ? data.chatRoom : chatRoom))
      );

      setIsEditModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error updating chat room:", error);
      setError("An unexpected error occurred");
    }
  };

  const handleDeleteChatroom = async () => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/chatrooms/${selectedChatRoom.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete chat room");
        return;
      }

      // Remove the chat room from the state
      setChatRooms((prev) => prev.filter((chatRoom) => chatRoom.id !== selectedChatRoom.id));

      setIsDeleteModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error deleting chat room:", error);
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
              <h1 className="text-3xl">Chat Rooms</h1>
            </div>
            <div className="p-8">
              <div>
                <h1>Chat Rooms:</h1>
                <div className="lg:grid-cols-4 md:grid-cols-4 grid-cols-1 gap-4 flex-row grid">
                  <button
                    className="card-sm bg-neutral-100 hover:cursor-pointer hover:brightness-105 transition-all"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create new chat room
                  </button>
                  {chatRooms.map((chatRoom) => (
                    <div
                      key={chatRoom.id}
                      className="card-sm bg-neutral-100 p-4 hover:cursor-pointer hover:brightness-105 transition-all"
                      onClick={() => router.push(`/organization/${orgId}/chatroom/${chatRoom.id}`)}
                    >
                      <h2>{chatRoom.name}</h2>
                      <p>Members: {chatRoom.access.length}</p>
                      <div className="flex gap-2 mt-2">
                        {/* Edit Button */}
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering parent click event
                            setSelectedChatRoom(chatRoom);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        {/* Delete Button */}
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering parent click event
                            setSelectedChatRoom(chatRoom);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Chatroom Modal */}
      {isCreateModalOpen && (
        <CreateChatroomModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateChatroom}
          orgId={orgId}
        />
      )}

      {/* Edit Chatroom Modal */}
      {isEditModalOpen && selectedChatRoom && (
        <EditChatroomModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditChatroom}
          orgId={orgId}
          chatRoom={selectedChatRoom}
        />
      )}

      {/* Delete Chatroom Modal */}
      {isDeleteModalOpen && selectedChatRoom && (
        <DeleteChatroomModal
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteChatroom}
        />
      )}
    </>
  );
}