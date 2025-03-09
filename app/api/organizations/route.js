import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getUser from "@/utils/getUser";

// GET /api/organizations
export async function GET() {
  try {
    const result = await getUser();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const userId = result.user.id;

    // Fetch all organizations where the user is a member
    const organizations = await prisma.member.findMany({
      where: { userId },
      include: {
        organization: true,
      },
    });

    // Map organizations to include role and label
    const formattedOrganizations = organizations.map((member) => ({
      id: member.organization.id,
      name: member.organization.name,
      role: member.role,
      label: member.label,
    }));

    return NextResponse.json({ organizations }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/organizations
export async function POST(request) {
  try {
    const result = await getUser();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const userId = result.user.id;
    const { name } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    // Create the organization
    const organization = await prisma.organization.create({
      data: {
        name,
        owner: { connect: { id: userId } },
        members: {
          create: {
            user: { connect: { id: userId } },
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}