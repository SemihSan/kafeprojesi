import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const QRVerify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          throw new Error('Token bulunamadı');
        }

        const response = await fetch('/api/qr/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Token doğrulanamadı');
        }

        // Token geçerli, menü sayfasına yönlendir
        const tableId = data.tableId;
        navigate(`/menu?tableId=${tableId}`, { replace: true });

      } catch (error) {
        console.error('Token doğrulama hatası:', error);
        setError(error.message);
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">
            🔐 Güvenlik Kontrolü
          </h2>
          <p className="mt-2 text-gray-500">
            QR kod doğrulanıyor, lütfen bekleyin...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Erişim Reddedildi
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Olası Nedenler:
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>QR kodun süresi dolmuş olabilir (24 saat)</li>
                    <li>Geçersiz veya bozuk QR kod</li>
                    <li>Ağ bağlantısı sorunu</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Yeniden Dene
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              🏠 Ana Sayfaya Dön
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Sorun devam ederse lütfen kafe personeli ile iletişime geçin.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default QRVerify;