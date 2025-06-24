import React from 'react'
import {
  Box, Heading, SimpleGrid, Text, Spinner,
} from '@chakra-ui/react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from 'recharts'
import { useQuery } from '@tanstack/react-query'

const API_URL = 'http://localhost:8000/api/products/'

// Функция загрузки продуктов с фильтрами
const fetchProducts = async (filters) => {
  const params = new URLSearchParams()
  if (filters.minPrice !== undefined) params.append('min_price', filters.minPrice)
  if (filters.maxPrice !== undefined) params.append('max_price', filters.maxPrice)
  if (filters.minRating !== undefined) params.append('min_rating', filters.minRating)
  if (filters.minFeedbacks !== undefined) params.append('min_feedbacks', filters.minFeedbacks)

  const res = await fetch(`${API_URL}?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

// Кастомный тултип для гистограммы
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Box bg="white" border="1px solid #ccc" p={2} rounded="md" boxShadow="md">
        <Text fontWeight="bold">{data.range}</Text>
        <Text>Количество: {data.count}</Text>
      </Box>
    )
  }
  return null
}

// Кастомный тултип для линейного графика
const CustomLineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Box bg="white" border="1px solid #ccc" p={2} rounded="md" boxShadow="md">
        <Text>Рейтинг: {data.rating}</Text>
        <Text>Размер скидки: {data.discount} ₽</Text>
      </Box>
    )
  }
  return null
}

function ProductsCharts({ filters }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['products-charts', filters],
    queryFn: () => fetchProducts(filters),
    keepPreviousData: true,
  })

  if (isLoading) return <Box><Spinner /> Загрузка графиков...</Box>
  if (error) return <Box color="red.500">Ошибка загрузки графиков</Box>
  if (!data || data.length === 0) return <Box>Нет данных для отображения</Box>

  // Диапазоны цен для гистограммы (можно адаптировать под твои данные)
  const priceBuckets = [0, 1000, 3000, 5000, 10000, 20000, 50000]

  // Формируем данные для гистограммы: диапазон цены и количество товаров в этом диапазоне
  const priceDistribution = priceBuckets.slice(0, -1).map((start, i) => {
    const end = priceBuckets[i + 1]
    return {
      range: `${start} - ${end}`,
      count: data.filter(p => p.price >= start && p.price < end).length,
    }
  })

  // Для линейного графика: фильтруем товары со скидкой и отображаем рейтинг и размер скидки
  const discountData = data
    .filter(p => p.price > p.discount_price)
    .map(p => ({
      rating: Number(p.rating.toFixed(1)), // округляем рейтинг для лучшей читаемости
      discount: p.price - p.discount_price,
    }))

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} p={4}>
      <Box boxShadow="md" p={4} borderRadius="md" bg="white">
        <Heading size="md" mb={4}>Гистограмма цен</Heading>
        {priceDistribution.every(d => d.count === 0)
          ? <Text>Нет товаров в указанных диапазонах цены</Text>
          : (
            <BarChart width={500} height={300} data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" fill="#3182CE" />
            </BarChart>
          )}
      </Box>

      <Box boxShadow="md" p={4} borderRadius="md" bg="white">
        <Heading size="md" mb={4}>Скидка vs Рейтинг</Heading>
        {discountData.length === 0
          ? <Text>Нет товаров со скидкой</Text>
          : (
            <LineChart width={500} height={300} data={discountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" label={{ value: 'Рейтинг', position: 'insideBottomRight', offset: -5 }} />
              <YAxis label={{ value: 'Размер скидки', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomLineTooltip />} />
              <Line type="monotone" dataKey="discount" stroke="#D69E2E" dot />
            </LineChart>
          )}
      </Box>
    </SimpleGrid>
  )
}

export default ProductsCharts
