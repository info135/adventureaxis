//asdf
import mongoose from 'mongoose';

const BecomePartnerSchema = new mongoose.Schema({
    // Business Information
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    industryCategory: { type: String, required: true },
    yearOfEstablishment: { type: String, required: true },
    legalStructure: { type: String, required: true },
    isGstRegistered: { type: Boolean, default: false },
    gstNumber: { type: String },
    panNumber: { type: String, required: true },
    msmeNumber: { type: String },
    gstCertificate: {
        url: String,
        key: String
    },
    panCard: {
        url: String,
        key: String
    },
    msmeCertificate: {
        url: String,
        key: String
    },
    cancelledCheque: {
        url: String,
        key: String
    },
    productCatalog: {
        url: String,
        key: String
    },
    businessCard: {
        url: String,
        key: String
    },

    // Primary Contact
    contactPerson: { type: String, required: true },
    designation: { type: String, required: true },
    mobile: { type: String, required: true },
    alternateMobile: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    whatsappNumber: { type: String },

    // Business Address
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true },

    // Product & Supply
    deliveryCapability: { type: String, required: true },

    // Bank Details
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: Number, required: true },
    ifscCode: { type: String, required: true },
    branch: { type: String, required: true },

    // Compliance
    qualityCertifications: { type: String },
    returnPolicy: { type: String },

    // Verification
    aadhaarNumber: { type: String, },

    // Other
    referredBy: { type: String },

    // Additional Documents
    aadhaarUpload: {
        url: String,
        key: String
    },
    authorizedPersonPhoto: {
        url: String,
        key: String,
    },
    partnerUsername: { type: String },
    partnerPassword: { type: String },
    partnerPasswordPlain: { type: String },

    // Timestamps
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isActive: { type: Boolean, default: false },
    notes: { type: String },

}, { timestamps: true });

export default mongoose.models.BecomePartner || mongoose.model('BecomePartner', BecomePartnerSchema);