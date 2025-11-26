'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { statesIndia } from "../lib/IndiaStates"
import { toast } from 'react-hot-toast';
import Image from 'next/image';
const BecomePartner = () => {
    const [formData, setFormData] = useState({
        // Business Information
        businessName: '',
        businessType: '',
        industryCategory: '',
        yearOfEstablishment: '',
        legalStructure: '',
        isGstRegistered: false,
        gstNumber: '',
        panNumber: '',
        msmeNumber: '',

        // Primary Contact
        contactPerson: '',
        designation: '',
        mobile: '',
        alternateMobile: '',
        email: '',
        whatsappNumber: '',

        // Business Address
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: '',

        // Product & Supply
        deliveryCapability: '',

        // Bank Details
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',

        // Compliance
        qualityCertifications: '',
        returnPolicy: '',

        // Verification
        aadhaarNumber: '',

        // Other
        referredBy: '',
        additionalNotes: ''
    });
    const initialFormState = {
        // Business Information
        businessName: '',
        businessType: '',
        industryCategory: '',
        yearOfEstablishment: '',
        legalStructure: '',
        isGstRegistered: false,
        gstNumber: '',
        panNumber: '',
        msmeNumber: '',

        // Primary Contact
        contactPerson: '',
        designation: '',
        mobile: '',
        alternateMobile: '',
        email: '',
        whatsappNumber: '',

        // Business Address
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: '',

        // Product & Supply
        deliveryCapability: '',

        // Bank Details
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branch: '',

        // Compliance
        qualityCertifications: '',
        returnPolicy: '',

        // Verification
        aadhaarNumber: '',

        // Other
        referredBy: '',
        additionalNotes: ''
        // Add any other fields from your form
    };
    const [currentSection, setCurrentSection] = useState(1);
    const totalSections = 6;
    const [uploading, setUploading] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showThankYouModal, setShowThankYouModal] = useState(false);
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(field);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/cloudinary', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.url) {
                setFormData(prev => ({
                    ...prev,
                    [field]: { url: data.url, key: data.key || '' }
                }));
                toast.success('File uploaded successfully!');
            } else {
                throw new Error(data.error || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${field}: ${error.message || 'Unknown error occurred'}`);
        } finally {
            setUploading('');
        }
    };

    const removeFile = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: null
        }));
    };
    // Add these functions in your component
    const validateNumberInput = (e) => {
        // Allow only numbers and limit to 10 digits
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        return value;
    };

    const handleMobileChange = (e) => {
        const value = validateNumberInput(e);
        setFormData(prev => ({ ...prev, mobile: value }));
    };

    const handleWhatsAppNumberChange = (e) => {
        const value = validateNumberInput(e);
        setFormData(prev => ({ ...prev, whatsappNumber: value }));
    };

    const handleAlternateNumberChange = (e) => {
        const value = validateNumberInput(e);
        setFormData(prev => ({ ...prev, alternateMobile: value }));
    };

    const handlePincodeChange = (e) => {
        // For pincode, allow only numbers and limit to 6 digits
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setFormData(prev => ({ ...prev, pincode: value }));
    };
    const validateCurrentSection = () => {
        const sectionFields = {
            1: ['businessName', 'businessType', 'industryCategory', 'yearOfEstablishment',
                'legalStructure', 'gstNumber', 'panNumber'],
            2: ['contactPerson', 'designation', 'mobile', 'email', 'address', 'city', 'state', 'pincode', 'country'],
            3: ['deliveryCapability'],
            // Add more sections if needed
        };

        const currentFields = sectionFields[currentSection] || [];
        const missingFields = currentFields.filter(field => {
            // Special handling for gstNumber since it's conditionally required
            if (field === 'gstNumber' && !formData.isGstRegistered) {
                return false;
            }
            return !formData[field];
        });

        if (missingFields.length > 0) {
            const fieldLabels = {
                businessName: 'Business Name',
                businessType: 'Business Type',
                industryCategory: 'Industry Category',
                yearOfEstablishment: 'Year of Establishment',
                legalStructure: 'Legal Structure',
                gstNumber: 'GST Number',
                panNumber: 'PAN Number',
                contactPerson: 'Contact Person',
                designation: 'Designation',
                mobile: 'Mobile Number',
                email: 'Email',
                address: 'Address',
                city: 'City',
                state: 'State',
                pincode: 'Pincode',
                country: 'Country',
                deliveryCapability: 'Delivery Capability',
                panCard: "Pan Card",
                aadhaarUpload: "Aadhaar Upload",
                msmeCertificate: "MSME Certificate",
                cancelledCheque: "Cancelled Cheque",
                productCatalog: "Product Catalog",
                businessCard: "Business Card",
                bankName: "Bank Name",
                accountHolderName: "Account Holder Name",
                accountNumber: "Account Number",
                ifscCode: "IFSC Code",
                branch: "Branch",
                qualityCertifications: "Quality Certifications",
                returnPolicy: "Return Policy",
                aadhaarNumber: "Aadhaar Number",
                referredBy: "Referred By",
                additionalNotes: "Additional Notes"

            };

            const missingFieldNames = missingFields.map(field => fieldLabels[field] || field).join(', ');
            toast.error(`Please fill in all required fields: ${missingFieldNames}`);
            return false;
        }

        // Additional validation for specific fields
        if (currentSection === 1) {
            if (formData.isGstRegistered && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
                toast.error('Please enter a valid GST number');
                return false;
            }
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
                toast.error('Please enter a valid PAN number');
                return false;
            }
        }

        if (currentSection === 2) {
            if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
                toast.error('Please enter a valid 10-digit mobile number');
                return false;
            }
            if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                toast.error('Please enter a valid email address');
                return false;
            }
            if (!/^\d{6}$/.test(formData.pincode)) {
                toast.error('Please enter a valid 6-digit pincode');
                return false;
            }
        }
        if (currentSection === 3) {
            if (!formData.panCard) {
                toast.error('Please upload Pan Card');
                return false;
            }
            if (!formData.cancelledCheque) {
                toast.error('Please upload Cancelled Cheque');
                return false;
            }
            if (!formData.productCatalog) {
                toast.error('Please upload Product Catalog');
                return false;
            }
        }
        if (currentSection === 4) {
            if (!formData.bankName) {
                toast.error('Please enter Bank Name');
                return false;
            }
            if (!formData.accountHolderName) {
                toast.error('Please enter Account Holder Name');
                return false;
            }
            if (!formData.accountNumber) {
                toast.error('Please enter Account Number');
                return false;
            }
            if (!formData.ifscCode) {
                toast.error('Please enter IFSC Code');
                return false;
            }
            if (!formData.branch) {
                toast.error('Please enter Branch');
                return false;
            }
        }
        if (currentSection === 5) {
            if (!formData.returnPolicy) {
                toast.error('Please enter Return Policy');
                return false;
            }
            if (!formData.authorizedPersonPhoto) {
                toast.error('Please upload Authorized Person Photo');
                return false;
            }
        }
        return true;
    };

    const nextSection = () => {
        if (validateCurrentSection()) {
            setCurrentSection(prev => Math.min(prev + 1, totalSections));
        }
    };

    const prevSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
        }
    };
    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const loadingToast = toast.loading('Submitting application...');

        try {

            // Required fields check
            const requiredFields = {
                'Business Name': formData.businessName,
                'Email': formData.email,
                'Mobile': formData.mobile,
                'Contact Person': formData.contactPerson,
                'Business Type': formData.businessType,
                'Industry/Product Category': formData.industryCategory,
                'Year of Establishment': formData.yearOfEstablishment,
                'Legal Structure': formData.legalStructure,
                'PAN Number': formData.panNumber,
                'Address Line 1': formData.address,
                'City': formData.city,
                'State': formData.state,
                'Pincode': formData.pincode,
                'Country': formData.country
            };

            // Check for empty required fields
            const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value)
                .map(([field]) => field);

            if (missingFields.length > 0) {
                toast.dismiss(loadingToast);
                toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.dismiss(loadingToast);
                toast.error('Please enter a valid email address');
                return;
            }

            // Mobile number validation (10 digits)
            const mobileRegex = /^\d{10}$/;
            if (!mobileRegex.test(formData.mobile)) {
                toast.dismiss(loadingToast);
                toast.error('Please enter a valid 10-digit mobile number');
                return;
            }

            // Check if alternate number is provided and valid
            if (formData.alternateMobile && !mobileRegex.test(formData.alternateMobile)) {
                toast.dismiss(loadingToast);
                toast.error('Please enter a valid 10-digit alternate number or leave it empty');
                return;
            }

            // Check if PAN number is valid (10 characters, alphanumeric)
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (formData.panNumber && !panRegex.test(formData.panNumber)) {
                toast.dismiss(loadingToast);
                toast.error('Please enter a valid PAN number (e.g., AAAAA9999A)');
                return;
            }

            // If GST registered, validate GST number
            if (formData.isGstRegistered) {
                const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                if (!gstRegex.test(formData.gstNumber)) {
                    toast.dismiss(loadingToast);
                    toast.error('Please enter a valid GST number');
                    return;
                }
            }

            // If everything is valid, proceed with submission
            const response = await fetch('/api/becomePartner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setShowThankYouModal(true);
                setFormData(initialFormState);
                setCurrentSection(1);
                setIsTermsChecked(false);
                setIsPrivacyChecked(false);
                toast.dismiss(loadingToast);
                toast.success('Application submitted successfully!');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error in API route:', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            toast.dismiss(loadingToast);
            toast.error(error.message || 'An error occurred while submitting the form');
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Become a Partner</CardTitle>
                    <CardDescription className="text-center">
                        Fill out the form below to register as a partner with Adventure Axis
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${(currentSection / totalSections) * 100}%` }}
                        ></div>
                    </div>

                    {/* Section 1: Business Information */}
                    {currentSection === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Business Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business / Company Name *</Label>
                                    <Input
                                        id="businessName"
                                        name="businessName"
                                        className="required-field"
                                        placeholder="Enter Business / Company Name"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="businessType">Business Type *</Label>
                                    <Select
                                        value={formData.businessType}
                                        onValueChange={(value) => handleSelectChange('businessType', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select business type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manufacturer">Manufacturer</SelectItem>
                                            <SelectItem value="wholesaler">Wholesaler</SelectItem>
                                            <SelectItem value="distributor">Distributor</SelectItem>
                                            <SelectItem value="supplier">Supplier</SelectItem>
                                            <SelectItem value="agency">Agency</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="industryCategory">Industry / Product Category *</Label>
                                    <Input
                                        id="industryCategory"
                                        name="industryCategory"
                                        placeholder="Enter Industry / Product Category"
                                        value={formData.industryCategory}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="yearOfEstablishment">Year of Establishment *</Label>
                                    <Input
                                        type="number"
                                        id="yearOfEstablishment"
                                        name="yearOfEstablishment"
                                        placeholder="Enter Year of Establishment"
                                        value={formData.yearOfEstablishment}
                                        onChange={handleChange}
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="legalStructure">Legal Structure *</Label>
                                    <Select
                                        value={formData.legalStructure}
                                        onValueChange={(value) => handleSelectChange('legalStructure', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select legal structure" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="proprietor">Proprietor</SelectItem>
                                            <SelectItem value="partnership">Partnership</SelectItem>
                                            <SelectItem value="pvt-ltd">Pvt Ltd</SelectItem>
                                            <SelectItem value="llp">LLP</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isGstRegistered"
                                            name="isGstRegistered"
                                            className="w-5 h-5"
                                            checked={formData.isGstRegistered}
                                            onCheckedChange={(checked) =>
                                                setFormData(prev => ({ ...prev, isGstRegistered: checked }))
                                            }
                                        />
                                        <Label htmlFor="isGstRegistered">GST Registered?</Label>
                                    </div>

                                    {formData.isGstRegistered && (
                                        <div className="mt-2 space-y-2">
                                            <Label htmlFor="gstNumber">GST Number *</Label>
                                            <Input
                                                id="gstNumber"
                                                name="gstNumber"
                                                value={formData.gstNumber}
                                                onChange={handleChange}
                                                placeholder="22AAAAA0000A1Z5"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="panNumber">PAN Number *</Label>
                                    <Input
                                        id="panNumber"
                                        name="panNumber"
                                        value={formData.panNumber}
                                        onChange={handleChange}
                                        required
                                        placeholder="AAAAA0000A"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="msmeNumber">MSME/Udyam Registration No (Optional)</Label>
                                    <Input
                                        id="msmeNumber"
                                        name="msmeNumber"
                                        placeholder="Enter MSME/Udyam Registration No"
                                        value={formData.msmeNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Contact Information */}
                    {currentSection === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Primary Contact Person</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson">Contact Person Name *</Label>
                                    <Input
                                        id="contactPerson"
                                        name="contactPerson"
                                        placeholder="Enter Contact Person Name"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="designation">Designation *</Label>
                                    <Input
                                        id="designation"
                                        name="designation"
                                        placeholder="Enter Designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        required={!formData.designation}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number *</Label>
                                    <Input
                                        type="tel"
                                        id="mobile"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleMobileChange}
                                        required
                                        pattern="[0-9]{10}"
                                        placeholder="Enter Mobile Number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="alternateMobile">Alternate Mobile (optional)</Label>
                                    <Input
                                        type="tel"
                                        id="alternateMobile"
                                        name="alternateMobile"
                                        value={formData.alternateMobile}
                                        onChange={handleAlternateNumberChange}
                                        pattern="[0-9]{10}"
                                        placeholder="Enter Alternate Mobile Number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="contact@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                                    <Input
                                        type="tel"
                                        id="whatsappNumber"
                                        name="whatsappNumber"
                                        value={formData.whatsappNumber}
                                        onChange={handleWhatsAppNumberChange}
                                        required
                                        pattern="[0-9]{10}"
                                        placeholder="Enter WhatsApp Number"
                                    />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold pt-4">Business Address</h3>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Office Address *</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        placeholder="Enter Office Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City *</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter City"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="state">State *</Label>
                                        <Select
                                            value={formData.state}
                                            onValueChange={(value) => handleSelectChange('state', value)}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select State" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statesIndia.map((state, idx) => (
                                                    <SelectItem key={idx} value={state}>
                                                        {state}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pin Code *</Label>
                                        <Input
                                            id="pincode"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handlePincodeChange}
                                            required
                                            pattern="[0-9]{6}"
                                            placeholder="123456"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country *</Label>
                                        <Input
                                            id="country"
                                            name="country"
                                            placeholder="Enter Country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 3: Product & Supply */}
                    {currentSection === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Product & Supply Details</h3>

                            <div className="space-y-2">
                                <Label htmlFor="deliveryCapability">Delivery Capability *</Label>
                                <Select
                                    value={formData.deliveryCapability}
                                    onValueChange={(value) => handleSelectChange('deliveryCapability', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select delivery capability" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="local">Local</SelectItem>
                                        <SelectItem value="state">State</SelectItem>
                                        <SelectItem value="pan-india">PAN India</SelectItem>
                                        <SelectItem value="international">International</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold">Upload Documents</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formData.isGstRegistered && (
                                        <div className="space-y-2">
                                            <Label>GST Certificate {formData.isGstRegistered && '*'}</Label>
                                            {formData.gstCertificate?.url ? (
                                                <div className="relative group">
                                                    <div className="border rounded-md p-2 flex items-center justify-between">
                                                        <span className="truncate">
                                                            {formData.gstCertificate.url.split('/').pop()}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile('gstCertificate')}
                                                            className="text-destructive hover:text-destructive/80"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                    {formData.gstCertificate.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                        <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                            <Image
                                                                src={formData.gstCertificate.url}
                                                                alt="GST Certificate"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(e, 'gstCertificate')}
                                                        required={formData.isGstRegistered}
                                                        disabled={!formData.isGstRegistered || uploading === 'gstCertificate'}
                                                        className="flex-1"
                                                    />
                                                    {uploading === 'gstCertificate' && (
                                                        <div className="text-sm text-muted-foreground">Uploading...</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>PAN Card *</Label>
                                        {formData.panCard?.url ? (
                                            <div className="relative group">
                                                <div className="border rounded-md p-2 flex items-center justify-between">
                                                    <span className="truncate">
                                                        {formData.panCard.url.split('/').pop()}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile('panCard')}
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                {formData.panCard.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                    <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                        <Image
                                                            src={formData.panCard.url}
                                                            alt="PAN Card"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileUpload(e, 'panCard')}
                                                    required
                                                    disabled={uploading === 'panCard'}
                                                    className="flex-1"
                                                />
                                                {uploading === 'panCard' && (
                                                    <div className="text-sm text-muted-foreground">Uploading...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>MSME/Udyam Certificate (Optional)</Label>
                                        {formData.msmeCertificate?.url ? (
                                            <div className="relative group">
                                                <div className="border rounded-md p-2 flex items-center justify-between">
                                                    <span className="truncate">
                                                        {formData.msmeCertificate.url.split('/').pop()}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile('msmeCertificate')}
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                {formData.msmeCertificate.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                    <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                        <Image
                                                            src={formData.msmeCertificate.url}
                                                            alt="MSME Certificate"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileUpload(e, 'msmeCertificate')}
                                                    disabled={uploading === 'msmeCertificate'}
                                                    className="flex-1"
                                                />
                                                {uploading === 'msmeCertificate' && (
                                                    <div className="text-sm text-muted-foreground">Uploading...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bank Cancelled Cheque *</Label>
                                        {formData.cancelledCheque?.url ? (
                                            <div className="relative group">
                                                <div className="border rounded-md p-2 flex items-center justify-between">
                                                    <span className="truncate">
                                                        {formData.cancelledCheque.url.split('/').pop()}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile('cancelledCheque')}
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                {formData.cancelledCheque.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                    <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                        <Image
                                                            src={formData.cancelledCheque.url}
                                                            alt="Cancelled Cheque"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileUpload(e, 'cancelledCheque')}
                                                    required
                                                    disabled={uploading === 'cancelledCheque'}
                                                    className="flex-1"
                                                />
                                                {uploading === 'cancelledCheque' && (
                                                    <div className="text-sm text-muted-foreground">Uploading...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Product Catalog/Brochure *</Label>
                                        {formData.productCatalog?.url ? (
                                            <div className="relative group">
                                                <div className="border rounded-md p-2 flex items-center justify-between">
                                                    <span className="truncate">
                                                        {formData.productCatalog.url.split('/').pop()}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile('productCatalog')}
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                {formData.productCatalog.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                    <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                        <Image
                                                            src={formData.productCatalog.url}
                                                            alt="Product Catalog"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileUpload(e, 'productCatalog')}
                                                    required
                                                    disabled={uploading === 'productCatalog'}
                                                    className="flex-1"
                                                />
                                                {uploading === 'productCatalog' && (
                                                    <div className="text-sm text-muted-foreground">Uploading...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Business Card (Optional)</Label>
                                        {formData.businessCard?.url ? (
                                            <div className="relative group">
                                                <div className="border rounded-md p-2 flex items-center justify-between">
                                                    <span className="truncate">
                                                        {formData.businessCard.url.split('/').pop()}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile('businessCard')}
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                    <Image
                                                        src={formData.businessCard.url}
                                                        alt="Business Card"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileUpload(e, 'businessCard')}
                                                    disabled={uploading === 'businessCard'}
                                                    className="flex-1"
                                                />
                                                {uploading === 'businessCard' && (
                                                    <div className="text-sm text-muted-foreground">Uploading...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 4: Bank Details */}
                    {currentSection === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Bank Details</h3>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name *</Label>
                                    <Input
                                        id="bankName"
                                        name="bankName"
                                        placeholder="Enter Bank Name"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                                    <Input
                                        id="accountHolderName"
                                        name="accountHolderName"
                                        placeholder="Enter Account Holder Name"
                                        value={formData.accountHolderName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="accountNumber">Account Number *</Label>
                                        <Input
                                            id="accountNumber"
                                            name="accountNumber"
                                            type="number"
                                            placeholder="Enter Account Number"
                                            value={formData.accountNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ifscCode">IFSC Code *</Label>
                                        <Input
                                            id="ifscCode"
                                            name="ifscCode"
                                            placeholder="Enter IFSC Code"
                                            value={formData.ifscCode}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="branch">Branch *</Label>
                                    <Input
                                        id="branch"
                                        name="branch"
                                        placeholder="Enter Branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 5: Compliance & Verification */}
                    {currentSection === 5 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Compliance</h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="qualityCertifications">Quality Certifications (ISO/Organic/Handloom etc)</Label>
                                    <Textarea
                                        id="qualityCertifications"
                                        name="qualityCertifications"
                                        value={formData.qualityCertifications}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="List any quality certifications your business holds"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="returnPolicy">Return / Replacement Policy *</Label>
                                    <Textarea
                                        id="returnPolicy"
                                        name="returnPolicy"
                                        value={formData.returnPolicy}
                                        onChange={handleChange}
                                        rows={3}
                                        required
                                        placeholder="Describe your return and replacement policy"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 space-y-6">
                                <h3 className="text-lg font-semibold">Verification</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="aadhaarNumber">Aadhaar Number (Optional)</Label>
                                        <Input
                                            id="aadhaarNumber"
                                            name="aadhaarNumber"
                                            value={formData.aadhaarNumber}
                                            onChange={handleChange}
                                            pattern="[0-9]{12}"
                                            placeholder="12-digit Aadhaar number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Upload Aadhaar (Optional)</Label>
                                        {formData.aadhaarUpload?.url ? (
                                            <div className="relative group">
                                                <div className="border rounded-md p-2 flex items-center justify-between">
                                                    <span className="truncate">
                                                        {formData.aadhaarUpload.url.split('/').pop()}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile('aadhaarUpload')}
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                {formData.aadhaarUpload.url.match(/\.(jpg|jpeg|png)$/i) && (
                                                    <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                        <Image
                                                            src={formData.aadhaarUpload.url}
                                                            alt="Aadhaar Upload"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileUpload(e, 'aadhaarUpload')}
                                                    disabled={uploading === 'aadhaarUpload'}
                                                    className="flex-1"
                                                />
                                                {uploading === 'aadhaarUpload' && (
                                                    <div className="text-sm text-muted-foreground">Uploading...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Authorized Person Photo *</Label>
                                        {formData.authorizedPersonPhoto?.url ? (
                                            <div className="relative group">
                                                <div className="border rounded-md p-2 flex items-center justify-between">
                                                    <span className="truncate">
                                                        {formData.authorizedPersonPhoto.url.split('/').pop()}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile('authorizedPersonPhoto')}
                                                        className="text-destructive hover:text-destructive/80"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                <div className="mt-2 relative w-full h-40 border rounded-md overflow-hidden">
                                                    <Image
                                                        src={formData.authorizedPersonPhoto.url}
                                                        alt="Authorized Person Photo"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png"
                                                    onChange={(e) => handleFileUpload(e, 'authorizedPersonPhoto')}
                                                    required={!formData.authorizedPersonPhoto}
                                                    disabled={uploading === 'authorizedPersonPhoto'}
                                                    className="flex-1"
                                                />
                                                {uploading === 'authorizedPersonPhoto' && (
                                                    <div className="text-sm text-muted-foreground">Uploading...</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 6: Other Details & Submission */}
                    {currentSection === 6 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Other Details</h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="referredBy">Referred By (Optional)</Label>
                                    <Input
                                        id="referredBy"
                                        name="referredBy"
                                        value={formData.referredBy}
                                        onChange={handleChange}
                                        placeholder="Name of the person who referred you"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                                    <Textarea
                                        id="additionalNotes"
                                        name="additionalNotes"
                                        value={formData.additionalNotes}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Any additional information you'd like to share"
                                    />
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="terms"
                                            checked={isTermsChecked}
                                            onCheckedChange={(checked) => setIsTermsChecked(checked)}
                                        />
                                        <Label htmlFor="terms">
                                            I hereby declare that the information provided is true and correct to the best of my knowledge.
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="privacy"
                                            checked={isPrivacyChecked}
                                            onCheckedChange={(checked) => setIsPrivacyChecked(checked)}
                                        />
                                        <Label htmlFor="privacy">
                                            I agree to the Terms & Conditions and Privacy Policy of Adventure Axis.
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevSection}
                            disabled={currentSection === 1}
                        >
                            Previous
                        </Button>

                        {currentSection < totalSections ? (
                            <Button
                                type="button"
                                onClick={nextSection}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                    if (validateCurrentSection()) {
                                        handleSubmit();
                                    }
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : 'Submit Application'}
                            </Button>
                        )}
                    </div>

                    {/* Progress Indicator */}
                    <div className="text-center text-sm text-muted-foreground">
                        Step {currentSection} of {totalSections}
                    </div>
                </form>
            </CardContent>
        </Card>
            {/* Thank You Modal */ }
    {
        showThankYouModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
                    <button
                        onClick={() => setShowThankYouModal(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-12 h-12 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                        <p className="text-gray-600 mb-6">
                            Thanks for registering. Our team will review your application and contact you shortly after approval.
                        </p>
                        <button
                            onClick={() => setShowThankYouModal(false)}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }
        </div >


    );
};

export default BecomePartner;