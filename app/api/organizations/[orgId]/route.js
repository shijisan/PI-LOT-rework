import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getUser from "@/utils/getUser";

// GET /api/organizations/[orgId]
export async function GET(request, { params }) {
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

    // Fetch the organization by ID
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        owner: true, // Include the owner's details
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

    return NextResponse.json({ organization }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

