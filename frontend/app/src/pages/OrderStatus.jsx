import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import socketService from '../lib/socket'
import notificationService from '../lib/notification'

export default function OrderStatus() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')

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
    
    // WebSocket bağlantısını kur
    const socket = socketService.connect()
    if (order?.tableId) {
      socketService.joinTableRoom(order.tableId)
    }
    
    // Sipariş durumu güncelleme dinleyicisi
    socketService.on('order-status-update', (data) => {
      if (data.orderId === orderId) {
        setOrder(prev => prev ? { ...prev, status: data.status } : null)
        setStatusMessage(data.message)
        
        // Browser notification with notification service
        notificationService.showStatusUpdateNotification({
          id: orderId,
          status: data.status
        })
        
        // Mesajı 5 saniye sonra temizle
        setTimeout(() => setStatusMessage(''), 5000)
      }
    })
    
    // Her 30 saniyede bir güncelle (WebSocket ile daha az sıklıkta)
    const interval = setInterval(fetchOrder, 30000)
    
    return () => {
      clearInterval(interval)
      socketService.removeAllListeners('order-status-update')
      socketService.disconnect()
    }
  }, [orderId, order?.tableId])

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
      
      {/* Durum mesajı */}
      {statusMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="font-medium">{statusMessage}</span>
          </div>
        </div>
      )}
      
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


