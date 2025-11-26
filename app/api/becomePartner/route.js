import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import BecomePartner from "@/models/BecomePartner";
import { deleteFileFromCloudinary } from "@/utils/cloudinary";

// Get all partner applications (for admin)
export async function GET() {
    await connectDB();
    try {
        const applications = await BecomePartner.find().sort({ createdAt: -1 });
        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch partner applications" },
            { status: 500 }
        );
    }
}

// Submit a new partner application
export async function POST(req) {
    await connectDB();
    try {
        const formData = await req.json();
        // Basic validation
        if (!formData.businessName || !formData.email || !formData.mobile) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if application already exists with this email or mobile
        const existingApplication = await BecomePartner.findOne({
            $or: [
                { email: formData.email },
                { mobile: formData.mobile }
            ]
        });

        if (existingApplication) {
            return NextResponse.json(
                { error: "An application with this email or mobile already exists" },
                { status: 400 }
            );
        }

        const newApplication = new BecomePartner({
            ...formData,
            status: 'pending'
        });

        await newApplication.save();

        return NextResponse.json(
            { message: "Application submitted successfully", data: newApplication },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error submitting application:", error);
        return NextResponse.json(
            { error: `Failed to submit application: ${error.message}` },
            { status: 500 }
        );
    }
}

// Update application status (for admin)
// In app/api/becomePartner/route.js - PATCH handler
export async function PATCH(req) {
    await connectDB();
    try {
        const { id, isActive, status, notes, partnerUsername, partnerPassword, partnerPasswordPlain } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updateData = {};

        // Handle isActive toggle - only update isActive, not status
        if (isActive !== undefined) {
            updateData.isActive = isActive;
            // Don't modify the status here
        }

        // Handle explicit status updates (from other parts of the app)
        if (status && ['approved', 'rejected', 'pending'].includes(status)) {
            updateData.status = status;
            // Only update isActive if this is a status change from the admin panel
            if (status === 'approved') {
                updateData.isActive = true;
            } else if (status === 'rejected') {
                updateData.isActive = false;
            }
        }

        // Add other optional fields
        if (notes) updateData.notes = notes;
        if (partnerUsername) updateData.partnerUsername = partnerUsername;
        if (partnerPassword) updateData.partnerPassword = partnerPassword;
        if (partnerPasswordPlain) updateData.partnerPasswordPlain = partnerPasswordPlain;

        const updatedApplication = await BecomePartner.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedApplication) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedApplication, { status: 200 });
    } catch (error) {
        console.error("Error updating application:", error);
        return NextResponse.json(
            { error: `Failed to update application: ${error.message}` },
            { status: 500 }
        );
    }
}

// Delete application (for admin)
export async function DELETE(req) {
    await connectDB();
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: "Application ID is required" },
                { status: 400 }
            );
        }

        // Find the application first
        const application = await BecomePartner.findById(id);
        if (!application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        // Delete associated files from Cloudinary
        const fileFields = [
            'gstCertificate', 'panCard', 'msmeCertificate',
            'cancelledCheque', 'productCatalog', 'businessCard',
            'aadhaarUpload', 'authorizedPersonPhoto'
        ];

        for (const field of fileFields) {
            if (application[field]?.key) {
                try {
                    await deleteFileFromCloudinary(application[field].key);
                } catch (error) {
                    console.error(`Error deleting ${field} from Cloudinary:`, error);
                }
            }
        }

        // Delete application from database
        await BecomePartner.findByIdAndDelete(id);

        return NextResponse.json(
            { message: "Application deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting application:", error);
        return NextResponse.json(
            { error: `Failed to delete application: ${error.message}` },
            { status: 500 }
        );
    }
}
