import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getUser from "@/utils/getUser";

// GET /api/organizations/[orgId]/chatrooms
export async function GET(request, { params }) {
  const { orgId } = await params; // Directly access params.orgId

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
        members: true, // Include the members relationship
        chatRooms: {
          include: {
            access: {
              include: { member: true }, // Include members with access
            },
            messages: true, // Include messages in the chat room
          },
        },
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

    // Return the chat rooms
    return NextResponse.json({ chatRooms: organization.chatRooms }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/organizations/[orgId]/chatrooms
export async function POST(request, { params }) {
  const { orgId } = await params; // Directly access params.orgId

  try {
    const body = await request.json();
    const { name, memberIds } = body;

    // Log the incoming request body for debugging
    console.log("Incoming request body:", body);

    // Validate input
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid input: 'name' must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid input: 'memberIds' must be a non-empty array" },
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
        members: true, // Include the members relationship
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
    console.log("Valid members:", validMembers); // Log valid members for debugging

    if (validMembers.length !== memberIds.length) {
      const invalidIds = memberIds.filter((id) => !organization.members.some((member) => member.id === id));
      console.log("Invalid member IDs:", invalidIds); // Log invalid IDs for debugging

      return NextResponse.json(
        { error: `One or more member IDs are invalid: ${invalidIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Create the chat room
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name,
        organization: {
          connect: { id: orgId },
        },
        access: {
          create: validMembers.map((member) => ({
            member: {
              connect: { id: member.id }, // Connect to the Member record using its `id`
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

    return NextResponse.json({ chatRoom }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}