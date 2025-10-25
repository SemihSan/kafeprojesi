import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ tableId, size = 200 }) => {
  const [qrDataURL, setQrDataURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateSecureQR = async () => {
      try {
        setLoading(true);
        setError('');

        // Backend'den güvenli token al
        const response = await fetch('/api/qr/generate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tableId })
        });

        if (!response.ok) {
          throw new Error('Token oluşturulamadı');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Token oluşturulamadı');
        }

        // Güvenli URL ile QR kod oluştur
        const secureUrl = data.qrUrl;
        
        const dataURL = await QRCode.toDataURL(secureUrl, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });

        setQrDataURL(dataURL);
        setLoading(false);

      } catch (error) {
        console.error('Güvenli QR kod oluşturma hatası:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (tableId) {
      generateSecureQR();
    }
  }, [tableId, size]);

  if (loading) {
    return (
      <div className="flex flex-col items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-500">Güvenli QR kod oluşturuluyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-4">
        <div className="text-red-500 text-center">
          <p className="text-sm">❌ Hata: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      {qrDataURL && (
        <>
          <div className="relative">
            <img 
              src={qrDataURL} 
              alt={`Güvenli QR Kod - ${tableId}`}
              className="border-2 border-gray-300 rounded-lg shadow-sm"
            />
            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
              🔒 Güvenli
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium text-gray-700">
              Masa: {tableId}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ⏰ 24 saat geçerli
            </p>
            <p className="text-xs text-green-600 mt-1">
              🔐 Token korumalı
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default QRCodeGenerator;