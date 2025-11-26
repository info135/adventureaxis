"use client";

import { useMenu } from "@/context/MenuContext";
import { CategoryCarousel } from "@/components/Category/category-card";

export default function ProductCategoryBar() {
  const menuItems = useMenu();

  if (!menuItems || menuItems.length === 0) return null;

  const categories = menuItems.flatMap(cat =>
    Array.isArray(cat.subMenu)
      ? cat.subMenu.map(sub => ({
          title: sub.title,
          profileImage: sub.profileImage,
          url: `/category/${sub.url}`
        }))
      : []
  );

  return (
    <div className="mt-8 px-4 py-5">
      <h2 className="text-2xl md:text-3xl font-semibold md:px-10 px-5 underline">
        Categories
      </h2>

      <CategoryCarousel categories={categories} />
    </div>
  );
}
