'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const BrandCarousel = () => {
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/addBrand');
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-pulse flex space-x-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 w-32 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center">
        <div className="flex space-x-10 bg-white whitespace-nowrap px-4 py-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
          {[...brands].slice(0, 8).map((brand, index) => (
            <div 
              key={`${brand._id}-${index}`} 
              className="flex items-center justify-center flex-shrink-0 hover:scale-105 transition-all ease-in-out duration-300"
            >
              {brand.buttonLink ? (
                  <Link 
                  href={`/brands/${brand.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block h-14 w-28 relative"
                  >
                  {brand.frontImg?.url ? (
                      <Image
                      src={brand.frontImg.url}
                      alt={brand.buttonLink || 'Brand logo'}
                      priority
                      height={100}
                      width={200}
                      className="object-contain pt-1"
                      sizes="(max-width: 768px) 100px, 150px"
                      />
                    ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </Link>
              ) : (
                 null
              )}
              <div className="h-10 border-r border-black ml-5"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandCarousel;