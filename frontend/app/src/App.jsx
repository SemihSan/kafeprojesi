import { Routes, Route, Link, useSearchParams, Navigate } from 'react-router-dom'
import CustomerMenu from './pages/CustomerMenu.jsx'
import OrderStatus from './pages/OrderStatus.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/status/:orderId" element={<OrderStatus />} />
        <Route path="/admin" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

function Home() {
  const [sp] = useSearchParams()
  const tableId = sp.get('tableId')
  if (tableId) {
    return <Navigate to={`/menu?tableId=${tableId}`} />
  }
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">QR Kafe</h1>
      <p>QR kodu masada okutunuz. Ya da test için:</p>
      <div className="flex gap-2">
        <Link className="px-3 py-2 bg-black text-white rounded" to="/menu">Menüye Git</Link>
        <Link className="px-3 py-2 bg-gray-800 text-white rounded" to="/admin/login">Admin</Link>
      </div>
    </div>
  )
}


