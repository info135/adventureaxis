import PackageCard from "@/components/Category/package-card"
import { SidebarInset } from "@/components/ui/sidebar"

async function fetchProducts(query) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getPackages/byQuery?q=${query}`, {
      cache: "no-store",
    })
    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }
    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export default async function SearchPage({ searchParams }) {
  const query = await searchParams?.q || ""
  const products = await fetchProducts(query)
  console.log(products)
  
  return (
    <SidebarInset>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          Search Results for: <span className="text-blue-600">{query}</span>
        </h1>

        {/* Search Results */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <PackageCard key={product._id || product.code} pkg={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No products found. Try a different search.</p>
        )}
      </div>
    </SidebarInset>
  )
}