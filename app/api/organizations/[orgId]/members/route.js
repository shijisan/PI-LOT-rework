import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getUser from "@/utils/getUser";


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