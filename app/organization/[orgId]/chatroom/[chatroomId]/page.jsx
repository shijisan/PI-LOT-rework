"use client";
import { useEffect, useState, use } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

export default function Chatroom({ params }) {
  const orgId = use(params).orgId;
  const chatRoomId = use(params).chatroomId;
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (!orgId || !chatRoomId) {
      console.error("orgId or chatRoomId is undefined");
      setError("Invalid organization or chat room ID");
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
        setUser(data.user); // Set the user data
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("An unexpected error occurred");
      }
    };

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("messages")
          .select(`
            id, content, createdAt, 
            sender:members!messages_senderId_fkey (
              id,
              user:users!members_userId_fkey (id, email)
            )
          `)
          .eq("chatRoomId", chatRoomId)
          .order("createdAt", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error.message);
          setError(error.message);
          return;
        }
        setMessages(data || []); // Ensure messages is always an array
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("An unexpected error occurred");
      }
    };

    fetchUserData();
    fetchMessages();

    // Subscribe to real-time updates
    const subscription = supabaseClient
      .channel(`chatroom:${chatRoomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `chatRoomId=eq.${chatRoomId}` },
        (payload) => {
          console.log("Real-time update received:", payload);
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(subscription);
    };
  }, [orgId, chatRoomId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      alert("Message cannot be empty");
      return;
    }

    if (!user) {
      setError("User data is not available. Please refresh the page.");
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${orgId}/chatrooms/${chatRoomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          content: newMessage,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error sending message:", data.error);
        setError(data.error || "Failed to send message");
        return;
      }

      setNewMessage(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
      setError("An unexpected error occurred");
    }
  };

  const handleEditMessage = async (messageId, updatedContent) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/chatrooms/${chatRoomId}/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updatedContent }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error editing message:", data.error);
        setError(data.error || "Failed to edit message");
        return;
      }

      // Optimistically update the message in the UI
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: updatedContent } : msg))
      );
    } catch (error) {
      console.error("Error editing message:", error);
      setError("An unexpected error occurred");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/organizations/${orgId}/chatrooms/${chatRoomId}/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Error deleting message:", data.error);
        setError(data.error || "Failed to delete message");
        return;
      }

      // Optimistically remove the message from the UI
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("An unexpected error occurred");
    }
  };

  // Conditional rendering to ensure data is loaded
  if (!user || messages.length === 0) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <>
      <main className="md:max-w-[90vw] w-full mx-auto pt-[10vh] flex min-h-screen">
        <div className="flex flex-row flex-grow w-full py-[5vh] gap-4">
          <Sidebar />
          <div className="w-5/6 flex flex-col card-lg">
            <div className="pb-1 border-b border-black/20 mb-1 px-8 pt-8">
              <h1 className="text-3xl">Chat Room</h1>
            </div>
            <div className="p-8 flex flex-col h-[70vh]">
              <div className="flex-grow overflow-y-auto space-y-2">
                {messages.map((message) => {
                  // Null checks to prevent runtime errors
                  if (!message.sender?.user) {
                    console.warn("Message sender user data is missing:", message);
                    return null; // Skip rendering this message
                  }

                  return (
                    <div key={message.id} className="flex flex-col bg-neutral-100 p-3 rounded-md">
                      <p className="font-bold">{message.sender.user.email}</p>
                      <p>{message.content}</p>
                      <small className="text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </small>
                      {user.id === message.sender.user.id && (
                        <div className="flex gap-2 mt-2">
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={() => {
                              const updatedContent = prompt("Edit your message:", message.content);
                              if (updatedContent) {
                                handleEditMessage(message.id, updatedContent);
                              }
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
                />
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}