import { NextResponse } from 'next/server';
import connectDB from "@/lib/connectDB";
import BrandCategory from '@/models/BrandCategory';

export async function POST(req) {
    await connectDB();
    try {
        const requestData = await req.json();
        // console.log('Received brand category data:', JSON.stringify(requestData, null, 2));
        
        const {
            title,
            slug,
            buttonLink = '',
            banner = null,
            brand,
            products = [],
            profileImage = null,
            order = 0,
            active = true,
            brandCategory = ''
        } = requestData;

        // Validate required fields
        if (!title) {
            return NextResponse.json(
                { success: false, error: 'Title is required' },
                { status: 400 }
            );
        }

        if (!brand) {
            return NextResponse.json(
                { success: false, error: 'Brand ID is required' },
                { status: 400 }
            );
        }

        // Generate slug if not provided
        let generatedSlug = slug || title.toLowerCase().replace(/\s+/g, '-');
        
        // Check if a brand category with this slug already exists
        const existingWithSameSlug = await BrandCategory.findOne({ slug: generatedSlug });
        if (existingWithSameSlug && existingWithSameSlug.brand) {
            // If a brand category with this slug exists but has a different brand, append a timestamp
            const existingBrandId = existingWithSameSlug.brand._id 
                ? existingWithSameSlug.brand._id.toString() 
                : existingWithSameSlug.brand.toString();
                
            if (existingBrandId !== brand) {
                generatedSlug = `${generatedSlug}-${Date.now()}`;
            }
        }

        // Check for existing brand category with the same brand
        const existingBrandCategory = await BrandCategory.findOne({ brand });
        
        if (existingBrandCategory) {
            // Prepare update data
            const updateData = {
                title,
                slug: generatedSlug,
                buttonLink,
                ...(banner && { banner }),
                ...(profileImage && { profileImage }),
                order,
                active,
                brandCategory
            };

            // Only update products if we have new ones to add
            if (products && products.length > 0) {
                // First, ensure we don't have duplicate products
                const existingProductIds = existingBrandCategory.products.map(p => p.product?.toString());
                const newProducts = products.filter(p => !existingProductIds.includes(p.product?.toString()));
                
                if (newProducts.length > 0) {
                    updateData.$addToSet = {
                        products: { $each: newProducts }
                    };
                }
            }

            const updatedBrandCategory = await BrandCategory.findByIdAndUpdate(
                existingBrandCategory._id,
                updateData,
                { new: true }
            );

            return NextResponse.json({
                success: true,
                data: updatedBrandCategory,
                message: 'Brand category updated successfully'
            }, { status: 200 });
        }

        // Create new brand category if it doesn't exist
        const newBrandCategory = new BrandCategory({
            title,
            slug: generatedSlug,
            buttonLink,
            banner,
            profileImage,
            order,
            active,
            brand,
            products: products.map(p => ({
                product: p.product,
                productName: p.productName || 'Unnamed Product'
            })),
            brandCategory
        });

        await newBrandCategory.save();

        return NextResponse.json({
            success: true,
            data: newBrandCategory,
            message: 'Brand category created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Error in brand-categories API:', error);
        return NextResponse.json(
            { 
                success: false,
                error: `Failed to create/update brand category`,
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get('brand');
        
        const query = {};
        if (brandId) {
            query.brand = brandId;
        }

        const brandCategories = await BrandCategory.find(query)
            .populate({
                path: 'brand',
                select: 'title buttonLink'
            })
            .populate({
                path: 'products.product',
                model: 'Product',
                select: 'title'
            })
            .lean();

        return NextResponse.json(brandCategories);
    } catch (error) {
        // console.error('Error fetching brand categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brand categories' },
            { status: 500 }
        );
    }
}