import connectDB from "@/lib/connectDB"
import SubMenuFixed from "@/models/SubMenuFixed"
import { NextResponse } from "next/server"

export async function PUT(req, { params }) {
    await connectDB()
    try {
        const { id } = await params
        const body = await req.json()

        const updatedItem = await SubMenuFixed.findByIdAndUpdate(id, body, { new: true })
        if (!updatedItem) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "Item updated successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
    }
}

export async function DELETE(req, {params}) {
    await connectDB()
    try {
        const { id } = await params
        const deletedItem = await SubMenuFixed.findByIdAndDelete(id)
        if (!deletedItem) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 })
        }
        return NextResponse.json({ message: "Item deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
    }
}