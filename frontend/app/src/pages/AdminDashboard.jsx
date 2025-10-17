import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArchiveBoxIcon } from '@heroicons/react/24/outline'
import api, { setAuthToken } from '../lib/api'
import socketService from '../lib/socket'
import notificationService from '../lib/notification'
import NotificationSettings from '../components/NotificationSettings'
import LowStockAlert from '../components/LowStockAlert'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import Notification from '../components/Notification'
import Button from '../components/Button'
import HeroSection from '../components/HeroSection'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [tables, setTables] = useState([])
  const [selectedTableQR, setSelectedTableQR] = useState(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setAuthToken(token)
    refresh()
    
    // WebSocket bağlantısını kur
    const socket = socketService.connect()
    socketService.joinAdminRoom()
    
    // Yeni sipariş bildirimi
    socketService.on('new-order', (data) => {
      console.log('Yeni sipariş:', data)
      setOrders(prev => [data.order, ...prev])
      addNotification(data.message, 'success')
      notificationService.showOrderNotification(data.order)
    })
    
    // Sipariş güncelleme bildirimi
    socketService.on('order-updated', (data) => {
      console.log('Sipariş güncellendi:', data)
      setOrders(prev => prev.map(order => 
        order.id === data.order.id ? data.order : order
      ))
      addNotification(data.message, 'info')
      notificationService.showStatusUpdateNotification(data.order)
    })
    
    const interval = setInterval(refresh, 30000)
    
    return () => {
      clearInterval(interval)
      socketService.removeAllListeners('new-order')
      socketService.removeAllListeners('order-updated')
      socketService.disconnect()
    }
  }, [])

  const addNotification = (message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  async function refresh() {
    try {
      setLoading(true)
      const [o, p, t] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/products'),
        api.get('/admin/tables'),
      ])
      setOrders(o.data.orders)
      setProducts(p.data.products)
      setTables(t.data.tables)
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
      addNotification('Veriler yüklenirken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(id, status) {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status })
      refresh()
      addNotification('Sipariş durumu güncellendi', 'success')
    } catch (error) {
      addNotification('Sipariş durumu güncellenirken hata oluştu', 'error')
    }
  }

  async function showQRCode(tableId) {
    try {
      const res = await api.get(`/tables/${tableId}/qr`)
      setSelectedTableQR(res.data)
      setQrModalOpen(true)
    } catch (error) {
      addNotification('QR kod yüklenirken hata oluştu', 'error')
    }
  }

  const getStockStatus = (product) => {
    if ((product.quantity || 0) === 0) return 'Tükendi'
    if ((product.quantity || 0) <= (product.minStock || 5)) return 'Düşük'
    return 'Normal'
  }

  const getProductImage = (product) => {
    // Ürün kategorisine göre placeholder resim döndür
    const categoryImages = {
      'kahve': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'çay': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'tatlı': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'sandviç': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'salata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'içecek': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
    
    // Güvenli string dönüşümü
    const category = (product.category && typeof product.category === 'string') 
      ? product.category.toLowerCase() 
      : 'kahve'
    return categoryImages[category] || categoryImages['kahve']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <LoadingState text="Dashboard yükleniyor..." variant="skeleton" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Hero Section */}
      <HeroSection
        title="Admin Dashboard"
        subtitle="Siparişleri yönetin, stokları takip edin ve işletmenizi kontrol edin"
        backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
        overlay="gradient"
        className="min-h-[40vh]"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="glass" 
            size="lg"
            onClick={refresh}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Yenile
          </Button>
        </div>
      </HeroSection>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 -mt-20 relative z-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card
            variant="gradient"
            title="Aktif Siparişler"
            value={orders.filter(o => o.status !== 'completed').length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            className="animate-fade-in"
          />
          
          <Card
            variant="glass"
            title="Toplam Ürün"
            value={products.length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            className="animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          />
          
          <Card
            variant="default"
            title="Aktif Masalar"
            value={tables.filter(t => t.status === 'occupied').length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            }
            className="animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          />
          
          <Card
            variant="gradient"
            title="Düşük Stok"
            value={products.filter(p => getStockStatus(p) === 'Düşük' || getStockStatus(p) === 'Tükendi').length}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
            className="animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card
            variant="glass"
            title="Sipariş Geçmişi"
            description="Tüm siparişleri görüntüleyin ve raporlar alın"
            link="/admin/reports"
            linkText="Raporları Görüntüle"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            className="animate-slide-up"
          />
          
          <Card
            variant="default"
            title="Masa Yönetimi"
            description="Masaları yönetin ve QR kodlarını görüntüleyin"
            link="/admin/tables"
            linkText="Masaları Yönet"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            className="animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          />
          
          <Card
            variant="gradient"
            title="Stok Yönetimi"
            description="Ürün stoklarını kontrol edin ve güncelleyin"
            icon={<ArchiveBoxIcon className="w-6 h-6" />}
            className="animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth
                onClick={() => window.location.href = '/admin/stock'}
              >
                Stok Yönet
              </Button>
            </div>
          </Card>
        </div>

        {/* Active Orders */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
            Aktif Siparişler
          </h2>
          
          {orders.filter(o => o.status !== 'completed').length === 0 ? (
            <EmptyState
              title="Aktif sipariş bulunmuyor"
              description="Şu anda bekleyen veya hazırlanmakta olan sipariş yok."
              icon={
                <svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {orders.filter(o => o.status !== 'completed').map((order, index) => (
                <Card
                  key={order.id}
                  variant="default"
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display font-semibold text-neutral-800 mb-1">
                        Sipariş #{order.id.slice(-6)}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Masa: {order.table?.name || 'Bilinmiyor'}
                      </p>
                    </div>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Toplam:</span>
                      <span className="font-medium text-neutral-800">₺{order.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Ürün sayısı:</span>
                      <span className="font-medium text-neutral-800">{order.items?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/admin/order/${order.id}`}
                      className="flex-1"
                    >
                      Detaylar
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                      >
                        Onayla
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        Hazır
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Menu Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
            Menü Ürünleri
          </h2>
          
          {products.length === 0 ? (
            <EmptyState
              title="Henüz ürün eklenmemiş"
              description="Menünüze ürün ekleyerek başlayın."
              actionText="Ürün Ekle"
              onAction={() => console.log('Ürün ekleme sayfasına yönlendir')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product, index) => (
                <Card
                  key={product.id}
                  variant="image"
                  image={getProductImage(product)}
                  imageAlt={product.name}
                  title={product.name}
                  description={product.description}
                  value={`₺${product.price}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mt-4">
                    <StatusBadge 
                      status={getStockStatus(product)} 
                      type="stock" 
                    />
                    <span className="text-sm text-neutral-600">
                      Stok: {product.quantity || 0}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {products.length > 8 && (
            <div className="text-center mt-8">
              <Button variant="outline">
                Tüm Ürünleri Görüntüle ({products.length - 8} daha)
              </Button>
            </div>
          )}
        </div>

        {/* Tables Grid */}
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
            Masa Durumu
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table, index) => (
              <Card
                key={table.id}
                variant="glass"
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => showQRCode(table.id)}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h4 className="font-display font-medium text-neutral-800 mb-2">
                  {table.name}
                </h4>
                <StatusBadge 
                  status={table.status} 
                  type="table" 
                />
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrModalOpen && selectedTableQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-2xl p-8 max-w-md w-full animate-scale-in">
            <div className="text-center">
              <h3 className="text-xl font-display font-bold text-neutral-800 mb-4">
                {selectedTableQR.table.name} QR Kodu
              </h3>
              <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                <img 
                  src={selectedTableQR.qrCode} 
                  alt="QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setQrModalOpen(false)}
                fullWidth
              >
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <NotificationSettings />
      <LowStockAlert products={products} />
    </div>
  )
}


