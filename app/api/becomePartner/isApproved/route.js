import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import BecomePartner from "@/models/BecomePartner";

// Get all partner applications (for admin)
export async function GET() {
    await connectDB();
    try {
        const applications = await BecomePartner.find({status:"approved"})
        .select("partnerUsername partnerPasswordPlain businessName isActive status").lean()
        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch partner applications" },
            { status: 500 }
        );
    }
}