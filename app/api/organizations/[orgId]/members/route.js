import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getUser from "@/utils/getUser";

// GET /api/organizations/[orgId]/members
export async function GET(request, { params }) {
  try {
    const useParams = await params;
    const orgId = await useParams.orgId; // Extract orgId from params

    // Authenticate the user
    const result = await getUser();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const userId = result.user.id;

    // Fetch the organization by ID
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: true, // Include the user details for each member
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

    // Return the members of the organization
    return NextResponse.json(
      {
        members: organization.members.map((member) => ({
          id: member.id,
          name: member.user.name || member.user.email, // Use name if available, otherwise fallback to email
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}


// POST /api/organizations/[orgId]/members
export async function POST(request, { params }) {
    try {
      const useParams = await params;
      // Await the `params` object to access its properties
      const orgId = await useParams.orgId;
  
      // Authenticate the user
      const result = await getUser();
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
  
      const userId = result.user.id;
  
      // Parse the request body
      const { email, role } = await request.json();
  
      // Validate input
      if (!email || !role) {
        return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
      }
  
      // Fetch the organization by ID
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      });
  
      if (!organization) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }
  
      // Check if the user is the owner of the organization
      if (organization.ownerId !== userId) {
        return NextResponse.json({ error: "You are not the owner of this organization" }, { status: 403 });
      }
  
      // Find the user by email
      const userToAdd = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!userToAdd) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      // Check if the user is already a member of the organization
      const existingMember = await prisma.member.findFirst({
        where: {
          userId: userToAdd.id,
          organizationId: orgId,
        },
      });
  
      if (existingMember) {
        return NextResponse.json({ error: "User is already a member of this organization" }, { status: 400 });
      }
  
      // Add the user as a member
      const member = await prisma.member.create({
        data: {
          userId: userToAdd.id,
          organizationId: orgId,
          role,
        },
        include: {
          user: true,
        },
      });
  
      return NextResponse.json({ member }, { status: 201 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  }