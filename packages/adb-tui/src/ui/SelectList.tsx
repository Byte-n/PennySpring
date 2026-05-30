import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'

export interface SelectItem<T> {
  label: string
  value: T
}

interface SelectListProps<T> {
  items: ReadonlyArray<SelectItem<T>>
  onSelect: (value: T) => void
}

export function SelectList<T>({ items, onSelect }: SelectListProps<T>) {
  const [index, setIndex] = useState(0)

  useInput((_input, key) => {
    if (key.upArrow) {
      setIndex(prev => (prev - 1 + items.length) % items.length)
    } else if (key.downArrow) {
      setIndex(prev => (prev + 1) % items.length)
    } else if (key.return) {
      const item = items[index]
      if (item) {
        onSelect(item.value)
      }
    }
  })

  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Text key={i} color={i === index ? 'cyan' : undefined}>
          {i === index ? '› ' : '  '}
          {item.label}
        </Text>
      ))}
    </Box>
  )
}
