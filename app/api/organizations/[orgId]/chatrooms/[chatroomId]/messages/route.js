import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request, { params }) {
  const { orgId, chatroomId } = await params;

  if (!orgId || !chatroomId) {
    return new Response(JSON.stringify({ error: "Missing orgId or chatRoomId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { data, error } = await supabaseServer
      .from("messages")
      .select(`
        id,
        content,
        createdAt,
        sender: members!messages_senderId_fkey(
          id,
          user: users!members_userId_fkey(
            id,
            email
          )
        )
      `)
      .eq("chatRoomId", chatroomId)
      .order("createdAt", { ascending: true });


    if (error) {
      console.error("Error fetching messages:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request, { params }) {
  const { orgId, chatroomId } = await params;

  if (!orgId || !chatroomId) {
    return new Response(JSON.stringify({ error: "Missing orgId or chatRoomId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { userId, content } = body;

    if (!userId || !content) {
      return new Response(JSON.stringify({ error: "Missing userId or content" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the Member.id using userId and orgId
    const { data: member, error: memberError } = await supabaseServer
      .from("members")
      .select("id")
      .eq("userId", userId)
      .eq("organizationId", orgId)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: "User is not a member of this organization" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert the new message with the correct senderId (Member.id)
    const { data, error } = await supabaseServer.from("messages").insert([
      {
        chatRoomId: chatroomId,
        senderId: member.id,
        content: content,
      },
    ]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
