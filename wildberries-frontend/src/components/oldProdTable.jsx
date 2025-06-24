import React, { useMemo, useState } from 'react'
import {
  Table, Thead, Tbody, Tr, Th, Td, Box,
  NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper,
  Select, Flex, Text, Spinner, Button
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'

const API_URL = 'http://localhost:8000/api/products/';

const fetchProducts = async (filters) => {
  const params = new URLSearchParams()
  if (filters.minPrice) params.append('min_price', filters.minPrice)
  if (filters.minRating) params.append('min_rating', filters.minRating)
  if (filters.minFeedbacks) params.append('min_feedbacks', filters.minFeedbacks)

  const res = await fetch(`${API_URL}?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

function ProductsTable({ filters, setFilters }) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    keepPreviousData: true,
  })

  const [sortField, setSortField] = useState('rating')
  const [sortOrder, setSortOrder] = useState('desc')

  const sortedData = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      if (sortOrder === 'asc') return a[sortField] > b[sortField] ? 1 : -1
      else return a[sortField] < b[sortField] ? 1 : -1
    })
  }, [data, sortField, sortOrder])

  return (
    <Box>
      <Flex mb={4} gap={6} flexWrap="wrap">
        <Box>
          <Text>Мин. цена</Text>
          <NumberInput
            value={filters.minPrice}
            min={0}
            max={100000}
            onChange={(v) => setFilters(f => ({ ...f, minPrice: Number(v) }))}
            size="sm"
            maxW="120px"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>
        <Box>
          <Text>Мин. рейтинг</Text>
          <NumberInput
            value={filters.minRating}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => setFilters(f => ({ ...f, minRating: Number(v) }))}
            size="sm"
            maxW="120px"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>
        <Box>
          <Text>Мин. отзывов</Text>
          <NumberInput
            value={filters.minFeedbacks}
            min={0}
            onChange={(v) => setFilters(f => ({ ...f, minFeedbacks: Number(v) }))}
            size="sm"
            maxW="120px"
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>
        <Box>
          <Text>Сортировка</Text>
          <Select
            size="sm"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="rating">Рейтинг</option>
            <option value="feedback_count">Отзывов</option>
            <option value="price">Цена</option>
            <option value="name">Название</option>
          </Select>
        </Box>
        <Box>
          <Text>Порядок</Text>
          <Select
            size="sm"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">По убыванию</option>
            <option value="asc">По возрастанию</option>
          </Select>
        </Box>
        <Box>
          <Button size="sm" onClick={() => refetch()}>
            Обновить
          </Button>
        </Box>
      </Flex>

      {isLoading && <Spinner />}
      {error && <Text color="red.500">Ошибка загрузки</Text>}

      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Название</Th>
            <Th>Цена</Th>
            <Th>Цена со скидкой</Th>
            <Th>Рейтинг</Th>
            <Th>Отзывов</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedData.map((p) => (
            <Tr key={p.id}>
              <Td>{p.name}</Td>
              <Td>{p.price} ₽</Td>
              <Td>{p.discount_price} ₽</Td>
              <Td>{p.rating.toFixed(1)}</Td>
              <Td>{p.feedback_count}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}

export default ProductsTable
