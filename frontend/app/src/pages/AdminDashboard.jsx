import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { setAuthToken } from '../lib/api'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [tables, setTables] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setAuthToken(token)
    refresh()
    
    // Her 3 saniyede bir güncelle
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [])

  async function refresh() {
    const [o, p, t] = await Promise.all([
      api.get('/admin/orders'),
      api.get('/admin/products'),
      api.get('/admin/tables'),
    ])
    setOrders(o.data.orders)
    setProducts(p.data.products)
    setTables(t.data.tables)
  }

  async function updateOrderStatus(id, status) {
    await api.patch(`/admin/orders/${id}/status`, { status })
    refresh()
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
        <button className="px-3 py-2 bg-gray-200 rounded" onClick={refresh}>Yenile</button>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Siparişler</h2>
        <div className="space-y-2">
          {orders.map(o => (
            <div key={o.id} className="p-3 bg-white rounded shadow">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{o.table?.name}</div>
                  <div className="text-sm text-gray-600">Durum: {o.status} • Toplam: {(o.totalCents/100).toFixed(2)} ₺</div>
                </div>
                <div className="flex gap-2">
                  {['CONFIRMED','PREPARING','READY','SERVED','CANCELLED'].map(s => (
                    <button key={s} className="px-2 py-1 border rounded" onClick={()=>updateOrderStatus(o.id,s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Ürünler</h2>
        <div className="grid grid-cols-1 gap-2">
          {products.map(p => (
            <div key={p.id} className="p-3 bg-white rounded shadow flex justify-between">
              <div>{p.name} – {(p.priceCents/100).toFixed(2)} ₺</div>
              <div className="text-sm text-gray-600">{p.inStock ? 'Stokta' : 'Stok Yok'}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Masalar</h2>
        <div className="grid grid-cols-2 gap-2">
          {tables.map(t => (
            <div key={t.id} className="p-3 bg-white rounded shadow">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-600">Durum: {t.status}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Link to="/" className="text-blue-600">Müşteri sayfasına dön</Link>
      </section>
    </div>
  )
}


