"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import bcrypt from 'bcryptjs';
import { Search, Eye, X } from "lucide-react";
import { FileText, Building2, User, MapPin, Banknote } from "lucide-react";
// Helper component for consistent info rows
function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <span className="text-gray-500 font-medium">{label}:</span>
      <span className="col-span-2">{value}</span>
    </div>
  );
}

function DocumentPreview({ url, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const fileType = url?.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileType);
  const isPdf = fileType === "pdf";

  return (
    <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{label}</span>
        <button
          onClick={() => setIsOpen(true)}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </button>
      </div>

      {/* Thumbnail Preview */}
      <div
        className="mt-2 border rounded overflow-hidden cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {isImage ? (
          <img
            src={url}
            alt={label}
            className="w-full h-32 object-contain bg-gray-50"
          />
        ) : isPdf ? (
          <div className="w-full h-32 flex items-center justify-center bg-gray-50">
            <FileText className="h-16 w-16 text-gray-400" />
          </div>
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-gray-50">
            <File className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Full-size Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">{label}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              {isImage ? (
                <img
                  src={url}
                  alt={label}
                  className="max-w-full max-h-[65vh] mx-auto"
                />
              ) : isPdf ? (
                <div className="w-full h-[65vh]">
                  <iframe
                    src={url}
                    className="w-full h-full border-0"
                    title={label}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <File className="h-20 w-20 text-gray-400 mb-4" />
                  <p className="mb-4">
                    Preview not available for this file type
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download {label}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const BecomePartner = ({ partnerDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({
    username: "",
    password: "",
  });

  if (!partnerDetails) {
    return (
      <div className="text-center py-8">Loading partner applications...</div>
    );
  }

  const filteredPartners = partnerDetails.filter((partner) => {
    const matchesSearch =
      partner.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.mobile?.includes(searchTerm) ||
      partner.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.panNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || partner.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleView = (partner) => {
    setSelectedPartner(partner);
    setIsViewOpen(true);
  };

  // Function to generate username from business name
  const generateUsername = (businessName) => {
    return (
      businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") // Remove special characters
        .substring(0, 12) + Math.floor(Math.random() * 1000)
    );
  };

  // Function to generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleStatusChange = async (id, newStatus, partner = null) => {
    // If status is being changed to approved, show credentials modal
    if (newStatus === "approved" && partner) {
      const username = generateUsername(partner.contactPerson);
      const password = generatePassword();

      setGeneratedCredentials({ username, password });
      setIsCredentialsModalOpen(true);
      setSelectedPartner(partner);
      return;
    }

    const loadingToast = toast.loading('Updating status...');

    try {
      const response = await fetch("/api/becomePartner", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          ...(newStatus === "approved" && generatedCredentials.username && {
            partnerUsername: generatedCredentials.username,
            partnerPassword: generatedCredentials.password,
          }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Dismiss loading toast and show success message
      toast.dismiss(loadingToast);
      toast.success(`Status updated to ${newStatus}`);

      // Refresh after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleApproveWithCredentials = async () => {
    if (!selectedPartner) return;

    const loadingToast = toast.loading('Approving vendor...');

    try {
      const plainPassword = generatedCredentials.password || generatePassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      // First update the partner status
      const updateResponse = await fetch("/api/becomePartner", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedPartner._id,
          status: "approved",
          partnerUsername: generatedCredentials.username,
          partnerPassword: hashedPassword, // Save hashed password
          partnerPasswordPlain: plainPassword, // Save plain text password
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update status");
      }

      // Send email with credentials
      const emailResponse = await fetch('/api/brevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedPartner.email,
          subject: 'Your Vendor Account Has Been Approved',
          htmlContent: `<!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Vendor Account Approved</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
                  .credentials { background: #fff; padding: 15px; border: 1px solid #e0e0e0; border-radius: 5px; margin: 20px 0; }
                  .button {
                      display: inline-block;
                      padding: 10px 20px;
                      background-color: #4CAF50;
                      color: white !important;
                      text-decoration: none;
                      border-radius: 5px;
                      margin: 15px 0;
                  }
                  .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
              </style>
          </head>
          <body>
              <div class="header">
                  <h2>Welcome to Adventure Axis Vendor Portal</h2>
              </div>
              
              <div class="content">
                  <p>Dear ${selectedPartner.contactPerson},</p>
                  
                  <p>We are pleased to inform you that your vendor application has been approved. You can now access your vendor dashboard using the credentials below:</p>
                  
                  <div class="credentials">
                      <p><strong>Website URL:</strong> <a href="https://www.adventureaxis.in/vendor/login">https://www.adventureaxis.in/vendor/login</a></p>
                      <p><strong>Username:</strong> ${generatedCredentials.username}</p>
                        <p><strong>Password:</strong> ${plainPassword}</p>
                    </div>                  
                  <div style="text-align: center;">
                      <a href="https://www.adventureaxis.in/vendor/login" class="button">Access Vendor Dashboard</a>
                  </div>
                  
                  <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                  
                  <p>Best regards,<br>Adventure Axis Team</p>
              </div>
              
              <div class="footer">
                  <p>This is an automated message, please do not reply to this email.</p>
                  <p>© ${new Date().getFullYear()} Adventure Axis. All rights reserved.</p>
              </div>
          </body>
          </html>`
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email, but vendor was approved');
        // Continue even if email fails since the approval was successful
      }

      setIsCredentialsModalOpen(false);
      setGeneratedCredentials({ username: "", password: "" });
      setSelectedPartner(null);

      // Dismiss loading toast and show success message
      toast.dismiss(loadingToast);
      toast.success('Vendor approved and credentials sent via email');

      // Refresh after a short delay to show success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || 'An error occurred while approving the vendor');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by business name, mobile, or GST..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Partner Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPartners.length > 0 ? (
              filteredPartners.map((partner, index) => (
                <TableRow key={partner._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {partner.businessName}
                  </TableCell>
                  <TableCell>{partner.mobile}</TableCell>
                  <TableCell>{partner.gstNumber || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${partner.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : partner.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {partner.status}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center justify-center gap-2 ">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(partner)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Select
                      value={partner.status}
                      onValueChange={(newStatus) =>
                        handleStatusChange(partner._id, newStatus, partner)
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No partner applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedPartner && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                      Partner Application Details
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied on: {new Date(selectedPartner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">Status:</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${selectedPartner.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedPartner.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {selectedPartner.status.charAt(0).toUpperCase() +
                        selectedPartner.status.slice(1)}
                    </span>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Information */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    <Building2 className="h-5 w-5 inline-block mr-2 text-blue-600" />
                    Business Information
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <InfoRow label="Business Name" value={selectedPartner.businessName} />
                    <InfoRow label="Business Type" value={selectedPartner.businessType} />
                    <InfoRow label="Industry Category" value={selectedPartner.industryCategory} />
                    <InfoRow label="Year Established" value={selectedPartner.yearOfEstablishment} />
                    <InfoRow label="Legal Structure" value={selectedPartner.legalStructure} />
                    <InfoRow label="GST Registered" value={selectedPartner.isGstRegistered ? "Yes" : "No"} />
                    {selectedPartner.isGstRegistered && (
                      <InfoRow label="GST Number" value={selectedPartner.gstNumber} />
                    )}
                    <InfoRow label="PAN Number" value={selectedPartner.panNumber} />
                    <InfoRow label="MSME Number" value={selectedPartner.msmeNumber || "N/A"} />
                    <InfoRow label="Delivery Capability" value={selectedPartner.deliveryCapability} />
                    <InfoRow label="Quality Certifications" value={selectedPartner.qualityCertifications || "N/A"} />
                    <InfoRow label="Return Policy" value={selectedPartner.returnPolicy || "N/A"} />
                    <InfoRow label="Referred By" value={selectedPartner.referredBy || "N/A"} />
                  </div>
                </div>

                {/* Contact & Bank Information */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      <User className="h-5 w-5 inline-block mr-2 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <InfoRow label="Contact Person" value={selectedPartner.contactPerson} />
                      <InfoRow label="Designation" value={selectedPartner.designation} />
                      <InfoRow label="Mobile" value={selectedPartner.mobile} />
                      <InfoRow label="Alternate Mobile" value={selectedPartner.alternateMobile || "N/A"} />
                      <InfoRow label="Email" value={selectedPartner.email} />
                      <InfoRow label="WhatsApp" value={selectedPartner.whatsappNumber || "N/A"} />
                      <InfoRow label="Aadhaar Number" value={selectedPartner.aadhaarNumber || "N/A"} />
                      <div className="pt-2">
                        <h4 className="font-medium text-gray-700 mb-2">Address:</h4>
                        <div className="pl-4 border-l-2 border-gray-200">
                          <p>{selectedPartner.address}</p>
                          <p>{selectedPartner.city}, {selectedPartner.state}</p>
                          <p>{selectedPartner.pincode}, {selectedPartner.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                      <Banknote className="h-5 w-5 inline-block mr-2 text-blue-600" />
                      Bank Details
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <InfoRow label="Bank Name" value={selectedPartner.bankName} />
                      <InfoRow label="Account Holder" value={selectedPartner.accountHolderName} />
                      <InfoRow label="Account Number" value={selectedPartner.accountNumber} />
                      <InfoRow label="IFSC Code" value={selectedPartner.ifscCode} />
                      <InfoRow label="Branch" value={selectedPartner.branch} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section - Full Width */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  <FileText className="h-5 w-5 inline-block mr-2 text-blue-600" />
                  Documents & Images
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { field: 'panCard', label: 'PAN Card' },
                    { field: 'cancelledCheque', label: 'Cancelled Cheque' },
                    { field: 'productCatalog', label: 'Product Catalog' },
                    { field: 'businessCard', label: 'Business Card' },
                    { field: 'aadhaarUpload', label: 'Aadhaar Card' },
                    { field: 'authorizedPersonPhoto', label: 'Authorized Person Photo' },
                    { field: 'gstCertificate', label: 'GST Certificate' },
                    { field: 'msmeCertificate', label: 'MSME Certificate' },
                  ].map(({ field, label }) => (
                    selectedPartner[field]?.url && (
                      <div key={field} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <DocumentPreview
                          url={selectedPartner[field].url}
                          label={label}
                        />
                        <div className="p-3 bg-gray-50 border-t">
                          <p className="text-sm font-medium text-center text-gray-700">{label}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsViewOpen(false)}
                  className="min-w-[120px]"
                >
                  Close
                </Button>
                <Button
                  variant={
                    selectedPartner.status === "rejected"
                      ? "outline"
                      : "destructive"
                  }
                  onClick={() => {
                    handleStatusChange(
                      selectedPartner._id,
                      selectedPartner.status === "rejected"
                        ? "pending"
                        : "rejected"
                    );
                    setIsViewOpen(false);
                  }}
                  className="min-w-[120px]"
                >
                  {selectedPartner.status === "rejected"
                    ? "Mark as Pending"
                    : "Reject"}
                </Button>
                {selectedPartner.status !== "approved" && (
                  <Button
                    onClick={() => {
                      handleStatusChange(
                        selectedPartner._id,
                        "approved",
                        selectedPartner
                      );
                      setIsViewOpen(false);
                    }}
                    className="min-w-[120px] bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog
        open={isCredentialsModalOpen}
        onOpenChange={setIsCredentialsModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-600">
              Partner Approved!
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Auto-generated login credentials for the partner
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={generatedCredentials.username}
                  readOnly
                  className="bg-gray-50 font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2"
                  onClick={() =>
                    navigator.clipboard.writeText(generatedCredentials.username)
                  }
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={generatedCredentials.password}
                  readOnly
                  className="bg-gray-50 font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-2"
                  onClick={() =>
                    navigator.clipboard.writeText(generatedCredentials.password)
                  }
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Please save these credentials securely.
                Share them with the partner through a secure channel.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsCredentialsModalOpen(false);
                setGeneratedCredentials({ username: "", password: "" });
                setSelectedPartner(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveWithCredentials}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Approval
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default BecomePartner;
