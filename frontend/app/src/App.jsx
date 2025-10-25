import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CustomerMenu from './pages/CustomerMenu'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import OrderStatus from './pages/OrderStatus'
import TableManagement from './pages/TableManagement'
import Reports from './pages/Reports'
import AdminOrderDetails from './pages/AdminOrderDetails'
import StockManagement from './pages/StockManagement'
import QRCodeDisplay from './pages/QRCodeDisplay'
import QRVerify from './pages/QRVerify'
import HeroSection from './components/HeroSection'
import Button from './components/Button'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        <Route path="/order-status/:orderId" element={<OrderStatus />} />
        <Route path="/qr/:token" element={<QRVerify />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tables" element={<ProtectedRoute><TableManagement /></ProtectedRoute>} />
        <Route path="/admin/qr-codes" element={<ProtectedRoute><QRCodeDisplay /></ProtectedRoute>} />
        <Route path="/admin/stock" element={<ProtectedRoute><StockManagement /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/admin/order/:orderId" element={<ProtectedRoute><AdminOrderDetails /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

function Home() {
  const [tableId, setTableId] = useState('')
  const [showManualEntry, setShowManualEntry] = useState(false)

  // URL'den tableId parametresini al
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tableIdFromUrl = urlParams.get('table')
    if (tableIdFromUrl) {
      setTableId(tableIdFromUrl)
    }
  }, [])

  const handleTableSubmit = () => {
    if (tableId) {
      window.location.href = `/menu/MASA001?tableId=${tableId}`
    }
  }

  // Test için örnek masa ID'leri
  const testTableIds = ['MASA001', 'MASA002', 'MASA003', 'MASA004', 'MASA005']

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="QR Menü Sistemi"
        subtitle="Modern ve kullanıcı dostu QR menü deneyimi ile siparişlerinizi kolayca verin"
        backgroundImage="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        overlay="gradient"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="glass" 
            size="lg"
            onClick={() => setShowManualEntry(!showManualEntry)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Masa Numarası Gir
          </Button>
          <Button 
            variant="glass" 
            size="lg"
            onClick={() => window.location.href = '/admin'}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          >
            Admin Paneli
          </Button>
        </div>
      </HeroSection>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Manual Table Entry */}
        {showManualEntry && (
          <div className="glass-effect rounded-2xl p-8 mb-12 animate-slide-up">
            <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6 text-center">
              Masa Numaranızı Girin
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value.toUpperCase())}
                placeholder="Örn: MASA001"
                className="input-modern flex-1"
              />
              <Button 
                variant="primary"
                onClick={handleTableSubmit}
                disabled={!tableId}
              >
                Menüye Git
              </Button>
            </div>
          </div>
        )}

        {/* Test Tables */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-display font-semibold text-neutral-700 mb-4">
            Test Masaları
          </h3>
          <p className="text-neutral-600 mb-8">
            Aşağıdaki test masa numaralarından birini kullanabilirsiniz
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testTableIds.map((id, index) => (
            <div 
              key={id}
              className="glass-effect rounded-2xl p-6 text-center card-hover group cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => window.location.href = `/menu/MASA001?tableId=${id}`}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15l4-4 4 4" />
                </svg>
              </div>
              <h4 className="font-display font-semibold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                {id}
              </h4>
              <p className="text-sm text-neutral-600">
                Menüyü görüntülemek için tıklayın
              </p>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-neutral-800 mb-2">QR Kod ile Kolay Erişim</h3>
            <p className="text-neutral-600 text-sm">Masanızdaki QR kodu okutarak anında menüye ulaşın</p>
          </div>
          
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-neutral-800 mb-2">Hızlı Sipariş</h3>
            <p className="text-neutral-600 text-sm">Menüden seçim yapın ve siparişinizi anında verin</p>
          </div>
          
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-neutral-800 mb-2">Anlık Takip</h3>
            <p className="text-neutral-600 text-sm">Siparişinizin durumunu gerçek zamanlı takip edin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App


