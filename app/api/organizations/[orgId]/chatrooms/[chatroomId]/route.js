import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getUser from "@/utils/getUser";

// GET /api/organizations/[orgId]/chatrooms/[chatroomId]
export async function GET(request, { params }) {
  const { orgId, chatroomId } = await params;

  try {
    // Authenticate the user
    const result = await getUser();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const userId = result.user.id;

    // Fetch the organization
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if the user is a member of the organization
    const isMember = organization.members.some((member) => member.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "You are not a member of this organization" }, { status: 403 });
    }

    // Fetch the chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatroomId },
      include: {
        access: {
          include: { member: true },
        },
      },
    });

    if (!chatRoom) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    return NextResponse.json({ chatRoom }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// PUT /api/organizations/[orgId]/chatrooms/[chatroomId]
export async function PUT(request, { params }) {
  const { orgId, chatroomId } = await params;

  try {
    const body = await request.json();
    const { name, memberIds } = body;

    // Validate input
    if (!name || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: "Invalid input: 'name' and 'memberIds' are required" },
        { status: 400 }
      );
    }

    // Authenticate the user
    const result = await getUser();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const userId = result.user.id;

    // Fetch the organization
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if the user is a member of the organization
    const isMember = organization.members.some((member) => member.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "You are not a member of this organization" }, { status: 403 });
    }

    // Ensure all provided member IDs belong to the organization
    const validMembers = organization.members.filter((member) => memberIds.includes(member.id));
    if (validMembers.length !== memberIds.length) {
      return NextResponse.json(
        { error: "One or more member IDs are invalid or do not belong to this organization" },
        { status: 400 }
      );
    }

    // Update the chat room
    const updatedChatRoom = await prisma.chatRoom.update({
      where: { id: chatroomId },
      data: {
        name,
        access: {
          deleteMany: {}, // Remove all existing access records
          create: validMembers.map((member) => ({
            member: {
              connect: { id: member.id },
            },
          })),
        },
      },
      include: {
        access: {
          include: { member: true },
        },
      },
    });

    return NextResponse.json({ chatRoom: updatedChatRoom }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/organizations/[orgId]/chatrooms/[chatroomId]
export async function DELETE(request, { params }) {
  const { orgId, chatroomId } = await params;

  try {
    // Authenticate the user
    const result = await getUser();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const userId = result.user.id;

    // Fetch the organization
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if the user is a member of the organization
    const isMember = organization.members.some((member) => member.userId === userId);
    if (!isMember) {
      return NextResponse.json({ error: "You are not a member of this organization" }, { status: 403 });
    }

    // Delete the chat room
    await prisma.chatRoom.delete({
      where: { id: chatroomId },
    });

    return NextResponse.json({ message: "Chat room deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}