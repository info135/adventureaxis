import connectDB from "@/lib/connectDB";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import Price from '@/models/Price';
import Gallery from '@/models/Gallery';
import Description from '@/models/Description';
import CategoryTag from '@/models/CategoryTag';
import ProductReview from '@/models/ProductReview';
import ProductTax from '@/models/ProductTax';
import ProductCoupons from '@/models/ProductCoupons';
import Quantity from '@/models/Quantity';
import ProductTagLine from '@/models/ProductTagLine';
export async function GET(request) {
  try {
    await connectDB();

    // Get search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // Search MongoDB for matching products
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: "i" } },  // Search in product title
        { code: { $regex: query, $options: "i" } },   // Search in product code
        { slug: { $regex: query, $options: "i" } }    // Search in product slug
      ],
      active: true  // Only fetch active products
    };

    // Find products matching the search query and populate necessary fields
    const products = await Product.find(searchQuery)
    .populate('price gallery description categoryTag productTagLine reviews quantity coupons taxes')
      .lean();

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}