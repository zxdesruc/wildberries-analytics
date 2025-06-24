import React, { useState } from "react"
import ProductsTable from "./ProductsTable"
import ProductsCharts from "./ProductsCharts"

function ProductsDashboard() {
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 100000,
    minRating: 0,
    minFeedbacks: 0,
  })

  return (
    <>
      <ProductsTable filters={filters} onFiltersChange={setFilters} />
      <ProductsCharts filters={filters} />
    </>
  )
}

export default ProductsDashboard
