import React, { useState, useEffect } from 'react';
import QRCodeGenerator from '../components/QRCodeGenerator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const QRCodeDisplay = () => {
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bulkTokens, setBulkTokens] = useState({});
  const [generatingTokens, setGeneratingTokens] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      if (!response.ok) {
        throw new Error('Masalar yüklenemedi');
      }
      const data = await response.json();
      setTables(data);
      setLoading(false);
    } catch (error) {
      console.error('Masa yükleme hatası:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const generateAllTokens = async () => {
    try {
      setGeneratingTokens(true);
      const tableIds = tables.map(table => table.id);
      
      const response = await fetch('/api/qr/generate-all-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableIds })
      });

      if (!response.ok) {
        throw new Error('Toplu token oluşturulamadı');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Toplu token oluşturulamadı');
      }

      setBulkTokens(data.tokens);
      setGeneratingTokens(false);
    } catch (error) {
      console.error('Toplu token oluşturma hatası:', error);
      setError(error.message);
      setGeneratingTokens(false);
    }
  };

  const handleTableSelect = (tableId) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAllTables = () => {
    setSelectedTables(tables.map(table => table.id));
  };

  const clearSelection = () => {
    setSelectedTables([]);
  };

  const downloadPDF = async () => {
    try {
      const element = document.getElementById('qr-print-area');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`qr-kodlari-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('PDF oluşturulurken hata oluştu: ' + error.message);
    }
  };

  const printSelectedQRCodes = () => {
    const printContent = document.getElementById('qr-print-area');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Kodları - Yazdırma</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              background: white;
            }
            .qr-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 30px; 
              page-break-inside: avoid;
            }
            .qr-item { 
              text-align: center; 
              border: 2px solid #ddd; 
              padding: 20px; 
              border-radius: 10px;
              page-break-inside: avoid;
            }
            .qr-item img { 
              max-width: 200px; 
              height: auto; 
            }
            .table-info {
              margin-top: 10px;
              font-size: 16px;
              font-weight: bold;
            }
            .security-info {
              margin-top: 5px;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .qr-grid { gap: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg">Masalar yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg">❌ Hata: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🔐 Güvenli QR Kod Yönetimi
        </h1>
        <p className="text-gray-600">
          Token korumalı QR kodları oluşturun, yazdırın ve yönetin
        </p>
      </div>

      {/* Güvenlik Bilgileri */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-green-400 text-xl">🔒</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Güvenlik Özellikleri
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Her QR kod 24 saat geçerli JWT token içerir</li>
                <li>Tokenlar masa ID'si ve zaman damgası ile korunur</li>
                <li>Süresi dolan tokenlar otomatik olarak geçersiz olur</li>
                <li>Her token tek kullanımlık değildir, ancak zaman sınırlıdır</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toplu İşlemler */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Toplu İşlemler</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={selectAllTables}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tümünü Seç ({tables.length})
          </button>
          
          <button
            onClick={clearSelection}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Seçimi Temizle
          </button>

          <button
            onClick={generateAllTokens}
            disabled={generatingTokens}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {generatingTokens ? 'Tokenlar Oluşturuluyor...' : 'Tüm Tokenları Yenile'}
          </button>
        </div>

        {selectedTables.length > 0 && (
          <div className="flex gap-4">
            <button
              onClick={printSelectedQRCodes}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Seçilenleri Yazdır ({selectedTables.length})
            </button>
            
            <button
              onClick={downloadPDF}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              PDF İndir ({selectedTables.length})
            </button>
          </div>
        )}
      </div>

      {/* QR Kodları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`bg-white rounded-lg shadow-md p-4 border-2 cursor-pointer transition-all ${
              selectedTables.includes(table.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleTableSelect(table.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Masa {table.id}</h3>
              <input
                type="checkbox"
                checked={selectedTables.includes(table.id)}
                onChange={() => handleTableSelect(table.id)}
                className="w-5 h-5 text-blue-600"
              />
            </div>
            
            <QRCodeGenerator tableId={table.id} size={180} />
            
            <div className="mt-3 text-sm text-gray-600">
              <p>Kapasite: {table.capacity} kişi</p>
              <p className="text-green-600 font-medium">🔐 Token Korumalı</p>
            </div>
          </div>
        ))}
      </div>

      {/* Yazdırma Alanı (Gizli) */}
      <div id="qr-print-area" style={{ display: 'none' }}>
        <div className="qr-grid">
          {selectedTables.map((tableId) => {
            const table = tables.find(t => t.id === tableId);
            return (
              <div key={tableId} className="qr-item">
                <QRCodeGenerator tableId={tableId} size={200} />
                <div className="table-info">
                  Masa {tableId}
                </div>
                <div className="security-info">
                  🔒 Güvenli Token Korumalı<br/>
                  ⏰ 24 Saat Geçerli<br/>
                  Kapasite: {table?.capacity || 'N/A'} kişi
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;