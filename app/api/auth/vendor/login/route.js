import { NextResponse } from 'next/server';
import { signIn as authSignIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../[...nextauth]/route';
import connectDB from '@/lib/connectDB';
import BecomePartner from '@/models/BecomePartner';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    await connectDB();

    const vendor = await BecomePartner.findOne({ 
      partnerUsername: username,
      status: 'approved',
      isActive: true
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Invalid credentials or account not approved' },
        { status: 401 }
      );
    }

    if (vendor.partnerPassword !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = {
      id: vendor._id.toString(),
      name: vendor.contactPerson,
      email: vendor.email,
      role: 'vendor',
      isVendor: true
    };

    const result = await signIn('credentials', {
      ...user,
      redirect: false
    });

    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'vendor',
        isVendor: true
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}