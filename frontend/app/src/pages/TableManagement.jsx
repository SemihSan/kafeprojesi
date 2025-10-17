import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { setAuthToken } from '../lib/api'
import notificationService from '../lib/notification'

export default function TableManagement() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTables, setSelectedTables] = useState([])
  const [mergeMode, setMergeMode] = useState(false)
  const [splitMode, setSplitMode] = useState(false)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) setAuthToken(token)
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const res = await api.get('/admin/tables')
      setTables(res.data.tables)
    } catch (err) {
      console.error('Tables fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(''), 5000)
    
    // Also show browser notification
    if (type === 'success') {
      notificationService.showSuccessNotification(message)
    } else if (type === 'error') {
      notificationService.showErrorNotification(message)
    } else {
      notificationService.showInfoNotification(message)
    }
  }

  const toggleTableSelection = (tableId) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    )
  }

  const handleMergeTables = async () => {
    if (selectedTables.length < 2) {
      showNotification('En az 2 masa seçmelisiniz', 'error')
      return
    }

    try {
      const mainTableId = selectedTables[0]
      const tableIds = selectedTables.slice(1)
      
      await api.post('/admin/tables/merge', {
        mainTableId,
        tableIds
      })
      
      showNotification(`${selectedTables.length} masa başarıyla birleştirildi`)
      setSelectedTables([])
      setMergeMode(false)
      fetchTables()
    } catch (err) {
      console.error('Merge error:', err)
      showNotification('Masa birleştirme işlemi başarısız', 'error')
    }
  }

  const handleSplitTables = async () => {
    if (selectedTables.length === 0) {
      showNotification('En az 1 masa seçmelisiniz', 'error')
      return
    }

    try {
      await api.post('/admin/tables/split', {
        tableIds: selectedTables
      })
      
      showNotification(`${selectedTables.length} masa başarıyla ayrıldı`)
      setSelectedTables([])
      setSplitMode(false)
      fetchTables()
    } catch (err) {
      console.error('Split error:', err)
      showNotification('Masa ayırma işlemi başarısız', 'error')
    }
  }

  const resetSelection = () => {
    setSelectedTables([])
    setMergeMode(false)
    setSplitMode(false)
  }

  const getTableStatusColor = (table) => {
    if (table.status === 'OCCUPIED') return 'bg-red-100 border-red-300 text-red-800'
    if (table.status === 'MERGED') return 'bg-purple-100 border-purple-300 text-purple-800'
    return 'bg-green-100 border-green-300 text-green-800'
  }

  const getTableStatusText = (table) => {
    if (table.status === 'OCCUPIED') return 'Dolu'
    if (table.status === 'MERGED') return 'Birleştirilmiş'
    return 'Boş'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Masalar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Masa Yönetimi</h1>
                <p className="text-gray-600">Masaları birleştirin veya ayırın</p>
              </div>
            </div>
            <Link 
              to="/admin"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Yönetici Paneli
            </Link>
          </div>

          {/* Bildirim */}
          {notification && (
            <div className={`px-4 py-3 rounded-lg mb-4 ${
              notification.type === 'error' 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {notification.type === 'error' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  )}
                </svg>
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          )}

          {/* Kontrol Butonları */}
          <div className="flex flex-wrap gap-3">
            {!mergeMode && !splitMode && (
              <>
                <button
                  onClick={() => setMergeMode(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Masa Birleştir
                </button>
                <button
                  onClick={() => setSplitMode(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Masa Ayır
                </button>
              </>
            )}

            {mergeMode && (
              <>
                <button
                  onClick={handleMergeTables}
                  disabled={selectedTables.length < 2}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    selectedTables.length >= 2
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Birleştir ({selectedTables.length} masa)
                </button>
                <button
                  onClick={resetSelection}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  İptal
                </button>
              </>
            )}

            {splitMode && (
              <>
                <button
                  onClick={handleSplitTables}
                  disabled={selectedTables.length === 0}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    selectedTables.length > 0
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Ayır ({selectedTables.length} masa)
                </button>
                <button
                  onClick={resetSelection}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                  İptal
                </button>
              </>
            )}
          </div>

          {(mergeMode || splitMode) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                {mergeMode && "Birleştirmek istediğiniz masaları seçin. İlk seçilen masa ana masa olacaktır."}
                {splitMode && "Ayırmak istediğiniz masaları seçin."}
              </p>
            </div>
          )}
        </div>

        {/* Masa Listesi */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Masalar</h2>
              <p className="text-gray-600 text-sm">{tables.length} adet masa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map(table => (
              <div 
                key={table.id} 
                className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  selectedTables.includes(table.id)
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : `border-gray-200 hover:shadow-md ${getTableStatusColor(table)}`
                } ${
                  (mergeMode || splitMode) ? 'hover:border-blue-400' : ''
                }`}
                onClick={() => {
                  if (mergeMode || splitMode) {
                    toggleTableSelection(table.id)
                  }
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{table.name}</h3>
                  {(mergeMode || splitMode) && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedTables.includes(table.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedTables.includes(table.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Durum:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTableStatusColor(table)}`}>
                      {getTableStatusText(table)}
                    </span>
                  </div>

                  {table.activeOrdersCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Aktif Sipariş:</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                        {table.activeOrdersCount}
                      </span>
                    </div>
                  )}

                  {table.mergedIntoId && (
                    <div className="text-xs text-purple-600">
                      Ana masa: {tables.find(t => t.id === table.mergedIntoId)?.name}
                    </div>
                  )}

                  {!mergeMode && !splitMode && (
                    <div className="pt-2 border-t border-gray-200">
                      <a 
                        href={table.qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        QR Kodu Görüntüle
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geri Dön Butonu */}
        <div className="text-center">
          <Link 
            to="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Yönetici Paneline Dön
          </Link>
        </div>
      </div>
    </div>
  )
}