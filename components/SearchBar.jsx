"use client";

import { Input } from "@/components/ui/input";
import { CalendarClock, MapPin, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function SearchBar({ placeholder }) {
    const [query, setQuery] = useState("");
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedPackages, setRelatedPackages] = useState([]);
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [quickCategories, setQuickCategories] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const router = useRouter();
    // console.log(relatedProducts)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/getAllMenuItems');
                const data = await res.json();
                // Flatten all subMenu titles from menu
                // console.log(data)
                const categories = [];
                (Array.isArray(data) ? data : []).forEach(menuItem => {
                    if (menuItem.subMenu && Array.isArray(menuItem.subMenu)) {
                        menuItem.subMenu.forEach(sub => {
                            if (sub.title && sub._id) categories.push({ id: sub._id, title: sub.title });
                        });
                    }
                });
                setCategories(categories);
            } catch (e) {
                setCategories([]);
            }
        };

        const fetchPackages = async () => {
            try {
                const res = await fetch("/api/getSearchPackages");
                const data = await res.json();
                if (data.packages) setPackages(data.packages);
            } catch (error) {
                // console.error("Error fetching packages:", error);
            }
        };

        fetchCategories();
        fetchPackages();

        const storedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
        setRecentSearches(storedSearches);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === "k") {
                event.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSearch = async (event) => {
        const value = event.target.value;
        setQuery(value);

        if (value.trim().length < 2) {
            setRelatedProducts([]);
            return;
        }

        try {
            let url = `/api/product/search?q=${encodeURIComponent(value)}`;
            // Always send category param, even if 'all' (backend can handle 'all')
            url += `&category=${encodeURIComponent(selectedCategory)}`;
            const res = await fetch(url);
            const data = await res.json();
            setRelatedProducts(data.products || []);
        } catch (error) {
            setRelatedProducts([]);
        }
    };

    const handleSubmit = () => {
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setQuery("")

        setIsSearchOpen(false);
    };

    // const clearRecentSearches = () => {
    //     localStorage.removeItem("recentSearches");
    //     setRecentSearches([]);
    // };

    return (
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
                <button className="p-2" aria-label="Open search">
                    <Search className="h-6 w-6" />
                </button>
            </DialogTrigger>
            <DialogContent
                className={`fixed top-[30%] w-full max-w-none rounded-none shadow-lg border-none p-0 bg-[#fefaf4] z-[1000] transition-all duration-200 overflow-y-visible ${query && relatedProducts.length > 0 ? 'min-h-[50vh] max-h-[100vh]' : 'h-auto'}`}
                style={{ margin: 0 }}
            >

                <DialogTitle>
                    <span className="sr-only">Product Search</span>
                </DialogTitle>
                <div className="flex items-center gap-2 px-10 h-6 min-h-[48px] bg-white sticky top-0 z-10 w-full">
                    <select
                        className="border rounded px-4 py-2 font-semibold bg-white text-black"
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        style={{ minWidth: 160 }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder={placeholder || "Search Product"}
                        className="flex-1 border-0 outline-none px-4 py-2 text-lg bg-transparent w-full"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmit();
                        }}
                    />
                    <button onClick={handleSubmit} className="p-2">
                        <Search className="h-5 w-5" />
                    </button>
                    <button onClick={() => setIsSearchOpen(false)} className="p-2">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
                <div className="h-px bg-black"></div>
                {query && relatedProducts.length > 0 && (
                    <div className="w-full px-8 pb-2 mt-2">
                        <h2 className="text-lg font-bold mb-2">Your Search Products</h2>
                        <div className="flex gap-6 overflow-x-auto pb-2">
                            {relatedProducts.map((prod, i) => (
                                <div
                                    key={prod._id || i}
                                    className="flex-shrink-0 w-40 h-42 rounded-xl flex flex-col items-center justify-center transition-shadow duration-200"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            router.push(`/product/${prod.slug}`);
                                            setIsSearchOpen(false);
                                        }}
                                        className="focus:outline-none"
                                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', width: '100%' }}
                                        tabIndex={0}
                                    >
                                        <img
                                            src={prod.image || "/placeholder.jpeg"}
                                            alt={prod.title}
                                            className="w-40 h-42 object-cover rounded-lg mb-3 hover:opacity-90 transition-opacity"
                                        />
                                    </button>
                                    <div className="flex flex-col gap-1 items-start w-full pr-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.push(`/product/${prod.slug}`);
                                                setIsSearchOpen(false);
                                            }}
                                            className="font-semibold text-black text-left text-wrap w-full hover:underline focus:outline-none"
                                            style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                                            tabIndex={0}
                                            title={prod.title}
                                        >
                                            {prod.title || "Product"}
                                        </button>
                                        <div className="flex gap-2">

                                            <span className="font-bold text-black whitespace-nowrap">₹{prod.price ? prod.price.toLocaleString("en-IN") : "—"}</span>
                                            <Link
                                                href={`/product/${prod.slug}`}
                                                className="bg-black text-white hover:bg-gray-800 transition-colors duration-300 uppercase text-sm font-bold px-4 py-1 rounded-full shadow-lg border-2 border-white text-nowrap"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
