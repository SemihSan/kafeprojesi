import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../lib/api';
import notificationService from '../lib/notification';

const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    checkLowStock();
    // Her 5 dakikada bir kontrol et
    const interval = setInterval(checkLowStock, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkLowStock = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/admin/products/stock-alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const products = response.data.products;
      
      // Yeni düşük stok ürünleri varsa bildirim göster
      if (products.length > 0 && (!lastCheck || products.length > lowStockProducts.length)) {
        const newLowStockCount = products.length - lowStockProducts.length;
        if (newLowStockCount > 0) {
          notificationService.showWarningNotification(
            `${newLowStockCount} ürünün stoğu düşük seviyede!`
          );
        }
        setIsVisible(true);
      }
      
      setLowStockProducts(products);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Düşük stok kontrolü hatası:', error);
    }
  };

  const dismissAlert = () => {
    setIsVisible(false);
  };

  if (!isVisible || lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Düşük Stok Uyarısı
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p className="mb-2">
                {lowStockProducts.length} ürünün stoğu düşük seviyede:
              </p>
              <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <li key={product.id} className="text-xs">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-yellow-600">
                      {' '}({product.quantity} adet kaldı)
                    </span>
                  </li>
                ))}
                {lowStockProducts.length > 5 && (
                  <li className="text-xs text-yellow-600">
                    ...ve {lowStockProducts.length - 5} ürün daha
                  </li>
                )}
              </ul>
            </div>
            <div className="mt-3">
              <a
                href="/admin/stock"
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
              >
                Stok Yönetimi →
              </a>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={dismissAlert}
                className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-400 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
              >
                <span className="sr-only">Kapat</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;