import React, { useMemo, useState, useEffect } from "react"
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Flex,
  Button, useDisclosure, Modal,
  ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  NumberInput, NumberInputField,
  Text, useColorModeValue,
} from "@chakra-ui/react"
import { SettingsIcon } from "@chakra-ui/icons"
import { useQuery } from "@tanstack/react-query"
import { Range, getTrackBackground } from "react-range"

const API_URL = "http://localhost:8000/api/products/"

const fetchProducts = async (filters) => {
  const params = new URLSearchParams()
  if (filters.minPrice !== undefined) params.append("min_price", filters.minPrice)
  if (filters.maxPrice !== undefined) params.append("max_price", filters.maxPrice)
  if (filters.minRating !== undefined) params.append("min_rating", filters.minRating)
  if (filters.minFeedbacks !== undefined) params.append("min_feedbacks", filters.minFeedbacks)

  const res = await fetch(`${API_URL}?${params.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

function ProductsTable({ filters, onFiltersChange }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Локальное состояние для модального окна фильтров, чтобы не менять глобальные фильтры сразу
  const [localFilters, setLocalFilters] = useState(filters)

  // Синхронизация локальных фильтров при открытии/закрытии или изменении глобальных
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
    }
  }, [isOpen, filters])

  const [sortField, setSortField] = useState("discount_price") // по умолчанию цена со скидкой
  const [sortOrder, setSortOrder] = useState("asc")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [sortMenuOpen, setSortMenuOpen] = useState(false)

  // Подгружаем данные с фильтрами из пропсов
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    keepPreviousData: true,
  })

  // Сбрасываем страницу на 1 при изменении фильтров
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const fieldValue = (item, field) => {
    if (field === "discount_price") return item.discount_price
    return item[field]
  }

  // Сортировка по клику
  const handleSortButtonClick = () => {
    setSortMenuOpen(prev => !prev)
  }

  const handleSortOptionClick = (field) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setSortMenuOpen(false)
  }

  const sortedData = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      let aVal = fieldValue(a, sortField)
      let bVal = fieldValue(b, sortField)

      // Приводим числовые поля к числу
      if (["discount_price", "price", "rating", "feedback_count"].includes(sortField)) {
        aVal = Number(aVal)
        bVal = Number(bVal)
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      return 0
    })
  }, [data, sortField, sortOrder])

  // Пагинация
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedData.slice(start, start + itemsPerPage)
  }, [sortedData, currentPage])

  const arrowIcon = sortOrder === "asc" ? "▲" : "▼"

  // Для слайдера
  const STEP = 500
  const MIN = 0

  // Максимальная цена для слайдера — либо из фильтров, либо из данных, либо 100000
  const maxPriceFromData = useMemo(() => {
    if (!data.length) return 100000
    return Math.max(...data.map(p => p.price))
  }, [data])

  const MAX = Math.max(filters.maxPrice || 100000, maxPriceFromData)

  return (
    <Box>
      {/* HEADER */}
      <Flex mb={4} gap={4} wrap="wrap" align="center">
        <Button
          leftIcon={<SettingsIcon />}
          onClick={onOpen}
          size="sm"
          px={6}
          minW="160px"
          whiteSpace="nowrap"
        >
          Фильтры
        </Button>

        <Box position="relative" display="inline-block">
          <Button onClick={handleSortButtonClick} size="sm" minW="140px">
            Сортировка:{" "}
            {{
              rating: "Рейтинг",
              feedback_count: "Отзывы",
              discount_price: "Цена",
              name: "Название",
            }[sortField]}{" "}
            {arrowIcon}
          </Button>
          {sortMenuOpen && (
            <Box
              position="absolute"
              mt={1}
              bg={useColorModeValue("white", "gray.700")}
              border="1px solid"
              borderColor={useColorModeValue("gray.200", "gray.600")}
              borderRadius="md"
              shadow="md"
              zIndex={10}
              w="160px"
            >
              {["rating", "feedback_count", "discount_price", "name"].map(field => (
                <Box
                  key={field}
                  px={3}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
                  onClick={() => handleSortOptionClick(field)}
                >
                  {field === "rating" && "Рейтинг"}
                  {field === "feedback_count" && "Отзывы"}
                  {field === "discount_price" && "Цена"}
                  {field === "name" && "Название"}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Flex>

      {/* TABLE */}
      {error && <Text color="red.500">Ошибка загрузки</Text>}
      {isLoading ? (
        <Text>Загрузка...</Text>
      ) : (
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>Название</Th>
              <Th>Цена</Th>
              <Th>Цена со скидкой</Th>
              <Th>Рейтинг</Th>
              <Th>Отзывы</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedData.map((p) => (
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
      )}

      {/* PAGINATION */}
      <Flex mt={4} justify="center" gap={4}>
        <Button
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          isDisabled={currentPage === 1}
        >
          Назад
        </Button>
        <Text>Страница {currentPage}</Text>
        <Button
          size="sm"
          onClick={() => setCurrentPage(p => p + 1)}
          isDisabled={currentPage * itemsPerPage >= sortedData.length}
        >
          Вперёд
        </Button>
      </Flex>

      {/* FILTER MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Фильтры</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={8}>
              Цена: от {localFilters.minPrice.toLocaleString()}₽ до {localFilters.maxPrice.toLocaleString()}₽
            </Text>
            <Range
              step={STEP}
              min={MIN}
              max={MAX}
              values={[localFilters.minPrice, localFilters.maxPrice]}
              onChange={(values) => {
                setLocalFilters(f => ({
                  ...f,
                  minPrice: values[0],
                  maxPrice: values[1]
                }))
              }}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '6px',
                    width: '100%',
                    background: getTrackBackground({
                      values: [localFilters.minPrice, localFilters.maxPrice],
                      colors: ['#3182ce', '#90cdf4', '#3182ce'],
                      min: MIN,
                      max: MAX,
                    }),
                    borderRadius: '4px',
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props, index }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '20px',
                    width: '20px',
                    backgroundColor: '#3182ce',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0px 2px 6px #AAA',
                  }}
                >
                  <div style={{ position: 'absolute', top: '-28px', color: '#3182ce', fontWeight: 'bold', fontSize: '12px' }}>
                    {localFilters.minPrice + index * (localFilters.maxPrice - localFilters.minPrice)}
                  </div>
                </div>
              )}
            />

            <Box mt={6}>
              <Text>Мин. рейтинг</Text>
              <NumberInput
                min={0}
                max={5}
                step={0.1}
                value={localFilters.minRating}
                onChange={(v) => setLocalFilters(f => ({ ...f, minRating: Number(v) }))}
                size="sm"
                maxW="120px"
              >
                <NumberInputField />
              </NumberInput>
            </Box>

            <Box mt={4}>
              <Text>Мин. отзывов</Text>
              <NumberInput
                min={0}
                value={localFilters.minFeedbacks}
                onChange={(v) => setLocalFilters(f => ({ ...f, minFeedbacks: Number(v) }))}
                size="sm"
                maxW="120px"
              >
                <NumberInputField />
              </NumberInput>
            </Box>
          </ModalBody>

          <ModalFooter gap={4}>
            <Button
              onClick={() => {
                const resetFilters = {
                  minPrice: 0,
                  maxPrice: MAX,
                  minRating: 0,
                  minFeedbacks: 0,
                }
                setLocalFilters(resetFilters)
                onFiltersChange(resetFilters)
                onClose()
              }}
            >
              Сбросить
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                onFiltersChange(localFilters)
                onClose()
                // refetch() не нужен, react-query перезапустит запрос с новыми filters
              }}
            >
              Применить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default ProductsTable
