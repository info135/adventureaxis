"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import toast from "react-hot-toast"

const PackageCard = ({ pkg, wishlist = [], addToWishlist, removeFromWishlist, setQuickViewProduct, handleAddToCart }) => {
  // If not passed as prop, fallback to context
  const cart = useCart?.() || {}
  const addToWishlistFn = addToWishlist || cart.addToWishlist
  const removeFromWishlistFn = removeFromWishlist || cart.removeFromWishlist
  const addToCartFn = handleAddToCart || cart.addToCart
  const [loading, setLoading] = useState(false)
  const isWishlisted = wishlist?.some?.(i => i.id === pkg._id)
  const formatNumber = (number) => new Intl.NumberFormat('en-IN').format(number)

  return (
    <div className="flex flex-col w-58 md:w-64 rounded-3xl mb-2 group cursor-pointer">
      {/* Image Section */}
      <div className="cursor-pointer" onClick={() => window.location.href = `/product/${pkg.slug}`}>
        <div className="relative w-full md:h-80 rounded-3xl overflow-hidden flex items-center justify-center group/image border border-gray-500">
          {/* GET 10% OFF Tag */}
          <div className="absolute top-6 left-4 z-10">
            {(() => {
              const coupon = pkg.coupon || pkg.coupons?.coupon;
              if (!coupon?.couponCode) return null;

              const { percent, amount } = coupon;

              let offerText;
              if (typeof percent === 'number' && percent > 0) {
                offerText = <>GET {percent}% OFF</>;
              } else if (typeof amount === 'number' && amount > 0) {
                offerText = <>GET ₹{amount} OFF</>;
              } else {
                offerText = <>Special Offer</>;
              }

              return (
                <div className="rounded-full px-4 py-1 text-xs md:text-sm font-bold shadow text-black tracking-tight" style={{ letterSpacing: 0 }}>
                  {offerText}
                </div>
              );
            })()}
          </div>
          <Image
            src={pkg?.gallery?.mainImage?.url || "/placeholder.jpeg"}
            alt={pkg?.title || "Product Image"}
            width={400}
            height={500}
            quality={60}
            className="object-cover w-full h-full rounded-3xl transition-transform duration-300 group-hover/image:scale-105"
          />
        </div>
        {/* Name and Price Section */}
        <div className="flex flex-col items-start justify-between px-2 pt-4 pb-2 mt-0">
          <Link
            href={`/product/${pkg.slug}`}
            className="font-bold hover:underline text-sm md:text-[18px] text-gray-900 leading-tight break-words whitespace-normal truncate cursor-pointer"
          >
            {pkg?.title}
          </Link>
          {(() => {
            const price = pkg.price || 0;
            const originalPrice = pkg.originalPrice || price;
            const coupon = pkg.coupon || pkg.coupons?.coupon;
            let discountedPrice = price;
            let hasDiscount = false;

            if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
              discountedPrice = price - (price * coupon.percent) / 100;
              hasDiscount = true;
            } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
              discountedPrice = price - coupon.amount;
              hasDiscount = true;
            } else if (originalPrice > price) {
              discountedPrice = price;
              hasDiscount = true;
            }
            if (hasDiscount && discountedPrice < originalPrice) {
              return (
                <span>
                  <span className="font-semibold text-md md:text-[18px] xl:text-[18px] text-black p-2">₹{formatNumber(Math.round(discountedPrice))}</span>
                  <del className="text-black font-semibold text-sm md:text-[18px] mr-2">₹{formatNumber(originalPrice)}</del>
                </span>
              );
            } else {
              return (
                <span className="font-semibold text-md md:text-[18px] p-1 text-black">₹{formatNumber(price)}</span>
              );
            }
          })()}
        </div>
      </div>
    </div>
  )
}

export default PackageCard
