
import connectDB from "@/lib/connectDB"
import SubMenuFixed from "@/models/SubMenuFixed"
import { NextResponse } from "next/server"

export async function GET() {
    await connectDB()
    try {
        const menuItems = await SubMenuFixed.find({})
        return NextResponse.json(menuItems)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 })
    }
}

export async function POST(req) {
    await connectDB()
    try {
        const body = await req.json()
        const { type, catTitle, categoryId, subCatTitle, subCategoryId, title, url } = body
        if (type === "category") {
            const newCategory = new SubMenuFixed({
                catTitle,
                active: true
            })
            await newCategory.save()
            return NextResponse.json({ message: "Category added successfully" })
        }

        if (type === "subcategory") {
            const category = await SubMenuFixed.findById(categoryId)
            if (!category) {
                return NextResponse.json({ error: "Category not found" }, { status: 404 })
            }

            category.subCat.push({
                title: subCatTitle,
                active: true
            })
            await category.save()
            return NextResponse.json({ message: "Subcategory added successfully" })
        }

        if (type === "package") {
            const category = await SubMenuFixed.findOne({ "subCat._id": subCategoryId })
            if (!category) {
                return NextResponse.json({ error: "Subcategory not found" }, { status: 404 })
            }

            const subCategory = category.subCat.id(subCategoryId)
            subCategory.subCatPackage.push({
                title,
                url,
                active: true
            })
            await category.save()
            return NextResponse.json({ message: "Package added successfully" })
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    } catch (error) {
        return NextResponse.json({ error: "Failed to add item" }, { status: 500 })
    }
}