import React, { useState } from 'react'
import { Container, Heading, Box } from '@chakra-ui/react'

import ProductsDashboard from './components/ProductsDashboard.jsx'
import ProductsTable from './components/ProductsTable.jsx'
import ProductsCharts from './components/ProductsCharts.jsx'

function App() {
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 100000,
    minRating: 0,
    minFeedbacks: 0,
  })

  return (
    <Container maxW="container.xl" py={6}>
      <Heading mb={6} textAlign="center">
        Wildberries Analytics
      </Heading>

      <Box mb={6}>
        <ProductsDashboard />
      </Box>

    </Container>
  )
}

export default App
