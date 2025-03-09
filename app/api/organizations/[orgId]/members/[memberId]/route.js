import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getUser from "@/utils/getUser";

// PATCH /api/organizations/[orgId]/members/[memberId]
export async function PATCH(request, { params }) {
  try {
    const { orgId, memberId } = await params;
    const { role } = await request.json();

    // Authenticate the user
    const result = await getUser();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const userId = result.user.id;

    // Fetch the organization
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

    // Update the member's role
    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json({ member: updatedMember }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// DELETE /api/organizations/[orgId]/members/[memberId]
export async function DELETE(request, { params }) {
  try {
    const { orgId, memberId } = await params;

    // Authenticate the user
    const result = await getUser();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const userId = result.user.id;

    // Fetch the organization
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

    // Delete the member
    await prisma.member.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ message: "Member deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}