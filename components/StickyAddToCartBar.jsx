"use client"
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

function hexToColorName(hex) {
  if (!hex) return '';
  const map = {
    "#FF0000": "Red",
    "#00FF00": "Green",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#FFC0CB": "Pink",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#000000": "Black",
    "#FFFFFF": "White",
    // Add more as needed
  };
  return map[hex.toUpperCase()] || hex;
}

function StickyAddToCartBar({ product }) {
  const { addToCart } = useCart();
  const { data: session } = useSession();
  // Extract sizes from variants
  const variants = Array.isArray(product?.quantity?.variants) ? product.quantity.variants : [];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const selectedVariant = variants[selectedVariantIdx] || variants[0];
  const [quantity, setQuantity] = useState(1);

  // Reset quantity to 1 when variant changes
  useEffect(() => { setQuantity(1); }, [selectedVariantIdx]);
  const [showBar, setShowBar] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 50 && currentScroll > lastScroll.current) {
        // Scrolling down, show bar
        setShowBar(true);
      } else if (currentScroll < lastScroll.current) {
        // Scrolling up, hide bar
        setShowBar(false);
      }
      lastScroll.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const isInStock = selectedVariant?.qty > 0;
  const hasAnyVariantInStock = product?.quantity?.variants?.some(v => v.qty > 0) ||
    product?.quantity?.varients?.some(v => v.qty > 0);


  // ... existing imports and component definition ...

  return (
    <div
      className={`hidden md:fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transform transition-transform duration-300 ${showBar ? "translate-y-0" : "translate-y-full"
        }`}
    >
      <div className="flex items-center justify-center gap-2 md:justify-between md:py-4 py-2 max-w-6xl mx-auto">
        {/* Product Info */}
        {/* In the product info section */}
        <div className="hidden md:flex items-center gap-4">
          <img
            src={product?.gallery?.mainImage?.url || "/placeholder.jpeg"}
            alt={product?.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <div className="font-semibold text-xl">{product?.title}</div>
            <div className="flex flex-col gap-1">
              {selectedVariant ? (
                selectedVariant.qty > 0 ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {session?.user?.isVendor && selectedVariant.vendorPrice
                          ? selectedVariant.vendorPrice
                          : (() => {
                            const coupon = product?.coupon || product?.coupons?.coupon;
                            let discountedPrice = selectedVariant.price;

                            if (coupon && typeof coupon.percent === 'number' && coupon.percent > 0) {
                              discountedPrice = selectedVariant.price - (selectedVariant.price * coupon.percent) / 100;
                              return (
                                <>
                                  <span className="text-black">
                                    ₹{discountedPrice.toFixed(2)}
                                  </span>
                                  <span className="line-through text-gray-500 text-sm px-2">
                                    ₹{selectedVariant.price.toFixed(2)}
                                  </span>
                                </>
                              );
                            } else if (coupon && typeof coupon.amount === 'number' && coupon.amount > 0) {
                              discountedPrice = selectedVariant.price - coupon.amount;
                              return (
                                <>
                                  <span className="line-through text-gray-500 text-sm px-2">
                                    ₹{selectedVariant.price.toFixed(2)}
                                  </span>
                                  <span className="text-black">
                                    ₹{discountedPrice.toFixed(2)}
                                  </span>
                                </>
                              );
                            }

                            return `₹${selectedVariant.price.toFixed(2)}`;
                          })()}
                      </span>
                    </div>
                    {product?.coupon &&  (
                      <span className="text-xs text-green-600">
                        {product.coupon.couponCode ? `${product.coupon.couponCode} applied` : 'Special discount applied'}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )
              ) : hasAnyVariantInStock ? (
                <span className="text-blue-600 font-medium">Select Variant</span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
              {selectedVariant && (
                <span className={`text-sm px-2 py-0.5 rounded ${selectedVariant.qty > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {selectedVariant.qty > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Variant Selector */}
        {variants.length > 0 && (
          <select
            className="border border-black px-2 md:px-4 py-2 rounded"
            value={selectedVariantIdx}
            onChange={e => setSelectedVariantIdx(Number(e.target.value))}
          >
            {variants.map((v, idx) => (
              <option
                key={v._id || idx}
                value={idx}
                disabled={v.qty <= 0}
              >
                {`${hexToColorName(v.color) || 'Color'} / ${v.size || 'Size'}`}
                {v.qty <= 0 ? ' (Sold Out)' : ''}
              </option>
            ))}
          </select>
        )}

        {/* Action Buttons */}
        <div className="flex items-center md:item-end justify-end gap-3">
          {/* Quantity Selector - Only show if variant is selected and in stock */}
          {selectedVariant?.qty > 0 && (
            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 border border-black rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                className="w-8 h-8 border border-black rounded flex items-center justify-center font-bold text-lg hover:bg-gray-100"
                onClick={() => setQuantity(q => Math.min(selectedVariant.qty, q + 1))}
                aria-label="Increase quantity"
                disabled={quantity >= selectedVariant.qty}
              >
                +
              </button>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            className={`md:px-6 px-4 py-2 rounded-md font-medium ${selectedVariant?.qty > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            onClick={() => {
              if (!selectedVariant) {
                toast.error("Please select a variant.");
                return;
              }
              if (selectedVariant.qty <= 0) {
                toast.error("This variant is out of stock.");
                return;
              }
              const coupon = product.coupon || product.coupons?.coupon;
              addToCart(selectedVariant, quantity, coupon);
            }}
            disabled={!selectedVariant || selectedVariant.qty <= 0}
          >
            {!selectedVariant
              ? 'Select Options'
              : selectedVariant.qty > 0
                ? 'Add to Cart'
                : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StickyAddToCartBar;