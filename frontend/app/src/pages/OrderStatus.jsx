import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'

export default function OrderStatus() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`)
        setOrder(res.data.order)
      } catch (err) {
        console.error('Order fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
    // Her 3 saniyede bir güncelle
    const interval = setInterval(fetchOrder, 3000)
    return () => clearInterval(interval)
  }, [orderId])

  if (loading) return <div className="p-6">Yükleniyor...</div>
  if (!order) return <div className="p-6">Sipariş bulunamadı.</div>

  const statusText = {
    PENDING: 'Beklemede',
    CONFIRMED: 'Onaylandı',
    PREPARING: 'Hazırlanıyor',
    READY: 'Hazır',
    SERVED: 'Servis Edildi',
    CANCELLED: 'İptal Edildi'
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sipariş Durumu</h1>
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold">Sipariş ID: {order.id}</div>
        <div className="text-lg">Durum: {statusText[order.status] || order.status}</div>
        <div className="text-sm text-gray-600">Masa: {order.table?.name}</div>
        <div className="text-sm text-gray-600">Toplam: {(order.totalCents/100).toFixed(2)} ₺</div>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Sipariş Detayları:</h3>
        {order.items?.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>{item.product.name} x {item.quantity}</span>
            <span>{(item.priceCents/100).toFixed(2)} ₺</span>
          </div>
        ))}
      </div>
    </div>
  )
}


