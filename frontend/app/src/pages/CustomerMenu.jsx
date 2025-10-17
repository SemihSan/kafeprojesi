import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../store/useCart'

export default function CustomerMenu() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTableIdModal, setShowTableIdModal] = useState(false)
  const [manualTableId, setManualTableId] = useState('')
  const { search } = useLocation()
  const navigate = useNavigate()
  const sp = new URLSearchParams(search)
  const tableId = sp.get('tableId')
  const cart = useCart()

  useEffect(() => {
    if (tableId) cart.setTableId(tableId)
  }, [tableId])

  useEffect(() => {
    (async () => {
      const res = await api.get('/menu')
      setCategories(res.data.categories)
      setLoading(false)
    })()
  }, [])

  async function submitOrder() {
    if (!cart.tableId) {
      setShowTableIdModal(true)
      return
    }
    if (cart.items.length === 0) return
    const payload = {
      tableId: cart.tableId,
      items: cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
    }
    const res = await api.post('/orders', payload)
    cart.clear()
    navigate(`/order-status/${res.data.order.id}`)
  }

  function handleManualTableIdSubmit() {
    if (manualTableId.trim()) {
      cart.setTableId(manualTableId.trim())
      setShowTableIdModal(false)
      setManualTableId('')
    }
  }

  if (loading) return <div className="p-6">Yükleniyor...</div>

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menü</h1>
        {cart.tableId && (
          <div className="text-sm text-gray-600">
            Masa: {cart.tableId}
          </div>
        )}
      </div>

      {!cart.tableId && (
        <div className="p-3 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">
            Masa bilgisi bulunamadı. QR kodu tarayın veya masa numarasını manuel girin.
          </p>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat.id} className="space-y-3">
          <h2 className="text-xl font-semibold">{cat.name}</h2>
          <div className="grid grid-cols-1 gap-3">
            {cat.products.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded shadow">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">{(p.priceCents/100).toFixed(2)} ₺</div>
                </div>
                <button className="px-3 py-2 bg-black text-white rounded" onClick={() => cart.addItem(p)}>Ekle</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Cart />
      <button onClick={submitOrder} className="w-full py-3 bg-green-600 text-white rounded disabled:opacity-50" disabled={cart.items.length===0}>Sipariş Ver</button>

      {/* Table ID Modal */}
      {showTableIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Masa Numarası</h2>
            <p className="text-sm text-gray-600 mb-4">
              Sipariş verebilmek için masa numarasını giriniz:
            </p>
            <input
              type="text"
              value={manualTableId}
              onChange={(e) => setManualTableId(e.target.value)}
              placeholder="örn: 5, A1, vb."
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleManualTableIdSubmit()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowTableIdModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded"
              >
                İptal
              </button>
              <button
                onClick={handleManualTableIdSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                disabled={!manualTableId.trim()}
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Cart() {
  const cart = useCart()
  const total = cart.items.reduce((s, i) => s + i.product.priceCents * i.quantity, 0)
  if (cart.items.length === 0) return null
  return (
    <div className="p-3 bg-white rounded shadow space-y-2">
      <div className="font-semibold">Sepet</div>
      {cart.items.map((i) => (
        <div key={i.product.id} className="flex items-center justify-between">
          <div>{i.product.name}</div>
          <div className="flex items-center gap-2">
            <input className="w-16 border rounded px-2 py-1" type="number" min={1} value={i.quantity} onChange={e => cart.changeQty(i.product.id, parseInt(e.target.value||'1',10))} />
            <button onClick={() => cart.removeItem(i.product.id)} className="text-red-600">Sil</button>
          </div>
        </div>
      ))}
      <div className="flex justify-between font-semibold">
        <span>Toplam</span>
        <span>{(total/100).toFixed(2)} ₺</span>
      </div>
    </div>
  )
}


