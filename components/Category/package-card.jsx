"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import toast from "react-hot-toast"
import QuickViewProductCard from "../QuickViewProductCard";
const PackageCard = ({ pkg, wishlist = [], addToWishlist, removeFromWishlist, handleAddToCart }) => {
  // console.log(pkg)
  // If not passed as prop, fallback to context
  const cart = useCart?.() || {}
  const addToWishlistFn = addToWishlist || cart.addToWishlist
  const removeFromWishlistFn = removeFromWishlist || cart.removeFromWishlist
  const addToCartFn = handleAddToCart || cart.addToCart
  const [loading, setLoading] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const isWishlisted = wishlist?.some?.(i => i.id === pkg._id)
  const formatNumber = (number) => new Intl.NumberFormat('en-IN').format(number)
  // Prevent background scroll when Quick View is open
  useEffect(() => {
    if (quickViewProduct) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [quickViewProduct]);

  return (
    <div className="flex flex-col max-w-80 rounded-3xl group cursor-pointer">
      {/* Image Section */}
      <div className="relative w-full md:h-92 rounded-3xl overflow-hidden flex items-center justify-center group/image border border-gray-300">
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
              <div className="bg-white rounded-full px-4 py-1 text-xs md:text-sm font-bold shadow text-black tracking-tight" style={{ letterSpacing: 0 }}>
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
        <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center translate-y-10 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300 py-4 ">
          <Button
            className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 uppercase text-sm font-bold px-8 py-3 rounded-full shadow-lg border-2 border-white"
            onClick={() => setQuickViewProduct(pkg)}
          >
            QUICK VIEW
          </Button>

        </div>
      </div>
      {/* Name and Price Section */}
      <div className="flex flex-col items-start justify-between px-2 py-4 mt-0">
        <Link
          href={`/product/${pkg.slug}`}
          className="font-bold hover:underline text-[15px] md:text-[18px] text-black leading-tight break-words whitespace-normal truncate cursor-pointer"
        >
          {pkg?.title}
        </Link>
        <div className="flex items-center gap-5 justify-between">


          {(() => {
            const price = pkg?.quantity?.variants[0].price || 0;
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
                  <span className="font-semibold text-[15px] md:text-[18px] text-black px-2">₹{formatNumber(Math.round(discountedPrice))}</span>
                  <del className="text-black font-semibold text-[15px] md:text-[18px] mr-2">₹{formatNumber(originalPrice)}</del>
                </span>
              );
            } else {
              return (
                <span className="font-semibold text-[15px] md:text-[18px] text-black">₹{formatNumber(price)}</span>
              );
            }
          })()}
          <Link
            href={`/product/${pkg.slug}`}
            className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 uppercase text-sm font-bold px-6 py-2 rounded-full shadow-lg  border-2 border-white text-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white rounded-2xl shadow-xl mx-auto md:max-w-4xl w-full relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-2xl font-bold z-50 rounded-full w-8 h-8 border border-black bg-black text-white flex items-center justify-center hover:bg-gray-100 hover:text-black focus:outline-none"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close quick view"
            >
              &times;
            </button>
            <QuickViewProductCard product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
          </div>
        </div>
      )}

    </div>
  )
}

export default PackageCard
