"use client";

import { useMenu } from "@/context/MenuContext";
import CategoryCard from "@/components/Category/category-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

export default function CategoryMenuBar() {
    const menuItems = useMenu();

    if (!menuItems || menuItems.length === 0) return null;

    const flatCategories = menuItems.flatMap(cat =>
        Array.isArray(cat.subMenu)
            ? cat.subMenu.map(sub => ({
                title: sub.title,
                profileImage: sub.profileImage,
                url: `/category/${sub.url}`
            }))
            : []
    );

    return (
        <div>
            <h2 className="text-2xl font-bold px-4 underline">Category</h2>
            <Carousel>
                <CarouselContent>
                    {flatCategories.map((cat, i) => (
                        <CarouselItem key={i} className="basis-1/2 md:basis-1/4 xl:basis-1/5 min-w-0 snap-start">
                            <CategoryCard category={cat} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 z-10 " />
                <CarouselPrevious className="!left-1 !top-1/2 !-translate-y-1/2 z-10" />
            </Carousel>
        </div>
    );
}
