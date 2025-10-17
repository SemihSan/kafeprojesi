export default function StatusBadge({ status, type = 'order' }) {
  const orderStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    PREPARING: 'bg-orange-100 text-orange-800 border-orange-200',
    READY: 'bg-green-100 text-green-800 border-green-200',
    SERVED: 'bg-gray-100 text-gray-800 border-gray-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200'
  }

  const tableStatusColors = {
    EMPTY: 'bg-green-100 text-green-800 border-green-200',
    OCCUPIED: 'bg-red-100 text-red-800 border-red-200',
    MERGED: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const stockStatusColors = {
    'Tükendi': 'bg-red-100 text-red-800',
    'Düşük': 'bg-yellow-100 text-yellow-800',
    'Yeterli': 'bg-green-100 text-green-800'
  }

  const getStatusColor = () => {
    switch (type) {
      case 'order':
        return orderStatusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
      case 'table':
        return tableStatusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
      case 'stock':
        return stockStatusColors[status] || 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = () => {
    if (type === 'stock') {
      return status
    }
    return status
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
      {getStatusText()}
    </span>
  )
}