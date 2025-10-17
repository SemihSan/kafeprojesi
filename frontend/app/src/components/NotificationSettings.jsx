import { useState, useEffect } from 'react'
import notificationService from '../lib/notification'

export default function NotificationSettings() {
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(notificationService.isSupported())
    setPermission(notificationService.getPermission())
  }, [])

  const requestPermission = async () => {
    const newPermission = await notificationService.requestPermission()
    setPermission(newPermission)
  }

  const testNotification = () => {
    notificationService.showInfoNotification('Bu bir test bildirimidir!')
  }

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <span className="text-yellow-800 font-medium">Bildirimler Desteklenmiyor</span>
        </div>
        <p className="text-yellow-700 text-sm mt-2">
          Tarayıcınız bildirim özelliğini desteklemiyor.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.868 19.718c.64.256 1.283.482 1.932.482 4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8c0 1.06.206 2.07.582 2.997L.868 19.718z"></path>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bildirim Ayarları</h3>
          <p className="text-gray-600 text-sm">Tarayıcı bildirimlerini yönetin</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Bildirim Durumu</h4>
            <p className="text-sm text-gray-600">
              {permission === 'granted' && 'Bildirimler etkin'}
              {permission === 'denied' && 'Bildirimler engellenmiş'}
              {permission === 'default' && 'Bildirim izni bekleniyor'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              permission === 'granted' ? 'bg-green-500' : 
              permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              permission === 'granted' ? 'text-green-700' : 
              permission === 'denied' ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {permission === 'granted' ? 'Etkin' : 
               permission === 'denied' ? 'Engelli' : 'Beklemede'}
            </span>
          </div>
        </div>

        {permission !== 'granted' && (
          <button
            onClick={requestPermission}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4.868 19.718c.64.256 1.283.482 1.932.482 4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8c0 1.06.206 2.07.582 2.997L.868 19.718z"></path>
            </svg>
            Bildirimleri Etkinleştir
          </button>
        )}

        {permission === 'granted' && (
          <button
            onClick={testNotification}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Test Bildirimi Gönder
          </button>
        )}

        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-800 font-medium">Bildirimler Engellendi</span>
            </div>
            <p className="text-red-700 text-sm mt-2">
              Bildirimleri etkinleştirmek için tarayıcı ayarlarından bu siteye izin vermeniz gerekiyor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}