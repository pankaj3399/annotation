// app/api/projects/route.ts
import { authOptions } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import { Template } from '@/models/Project';
import { getServerSession } from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Get the current session to identify the project manager
  await connectToDatabase();
 const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams
  const templateId = searchParams.get('templateId')

  if (templateId) {
    try {
      const template = await Template.find({ _id: templateId });
      return NextResponse.json({ success: true, template }, { status: 200 });
    } catch (error) {
      console.log(error)
      return NextResponse.json({ success: false, error: 'Failed to fetch template' }, { status: 400 });
    }
  }

  try {
    const template = await Template.find({ project_Manager: session.user.id });
    return NextResponse.json({ success: true, template }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch template' }, { status: 400 });
  }
}

export async function POST(req: Request) {
 const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  try {
    await connectToDatabase();
    const template = await Template.create({
      name,
      project_Manager: session.user.id,
    });
    return NextResponse.json({ success: true,  template }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create template' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
 const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { _id } = await req.json();

  try {
    await connectToDatabase();
    await Template.findByIdAndDelete(_id);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 400 });
  }
}
