import { saveAs } from 'file-saver'

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {}

  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      flattened[prefix + key] = ''
      continue
    }

    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const nested = flattenObject(obj[key], `${prefix}${key}_`)
      Object.assign(flattened, nested)
    } else if (Array.isArray(obj[key])) {
      // Handle arrays by creating numbered entries
      obj[key].forEach((item: any, index: number) => {
        if (typeof item === 'object') {
          const nested = flattenObject(item, `${prefix}${key}_${index + 1}_`)
          Object.assign(flattened, nested)
        } else {
          flattened[`${prefix}${key}_${index + 1}`] = item.toString()
        }
      })
    } else {
      flattened[prefix + key] = obj[key].toString()
    }
  }

  return flattened
}

function formatHeaderName(header: string): string {
  return header
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function exportToCSV(data: any[], filename: string) {
  // Flatten each object in the data array
  const flattenedData = data.map(item => flattenObject(item))

  // Get all unique headers
  const headers = Array.from(
    new Set(
      flattenedData.reduce((acc: string[], item) => {
        return [...acc, ...Object.keys(item)]
      }, [])
    )
  ).sort()

  // Create CSV content with formatted headers
  const csvContent = [
    // Headers row
    headers.map(header => `"${formatHeaderName(header)}"`).join(','),
    // Data rows
    ...flattenedData.map(item =>
      headers
        .map(header => {
          const value = item[header] || ''
          return `"${value.replace(/"/g, '""')}"`
        })
        .join(',')
    ),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${filename}.csv`)
}
