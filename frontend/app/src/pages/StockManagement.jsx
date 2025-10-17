import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import notificationService from '../lib/notification';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({ quantity: '', amount: '' });
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    priceCents: '',
    quantity: '',
    minStock: '5',
    categoryId: ''
  });
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceUpdate, setPriceUpdate] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      notificationService.showErrorNotification('Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/menu');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const updateStock = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.patch(`/admin/products/${productId}/stock`, {
        quantity: parseInt(quantity)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        notificationService.showSuccessNotification('Stok başarıyla güncellendi');
        fetchProducts(); // Refresh products
        setEditingProduct(null);
        setStockUpdate({ quantity: '', amount: '' });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      notificationService.showErrorNotification('Stok güncellenirken hata oluştu');
    }
  };

  const addStock = async (productId, amount) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/admin/products/${productId}/stock/add`, {
        amount: parseInt(amount)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        notificationService.showSuccessNotification('Stok başarıyla eklendi');
        fetchProducts(); // Refresh products
        setEditingProduct(null);
        setStockUpdate({ quantity: '', amount: '' });
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      notificationService.showErrorNotification('Stok eklenirken hata oluştu');
    }
  };

  const addNewProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/admin/products', {
        name: newProduct.name,
        priceCents: parseInt(newProduct.priceCents),
        quantity: parseInt(newProduct.quantity) || 0,
        minStock: parseInt(newProduct.minStock) || 5,
        categoryId: newProduct.categoryId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.product) {
        notificationService.showSuccessNotification('Yeni ürün başarıyla eklendi');
        fetchProducts();
        setShowAddProductForm(false);
        setNewProduct({
          name: '',
          priceCents: '',
          quantity: '',
          minStock: '5',
          categoryId: ''
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      notificationService.showErrorNotification('Ürün eklenirken hata oluştu');
    }
  };

  const updatePrice = async (productId, newPrice) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.patch(`/admin/products/${productId}`, {
        priceCents: parseInt(newPrice)
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.product) {
        notificationService.showSuccessNotification('Fiyat başarıyla güncellendi');
        fetchProducts();
        setEditingPrice(null);
        setPriceUpdate('');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      notificationService.showErrorNotification('Fiyat güncellenirken hata oluştu');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStockStatus = (product) => {
    if (product.quantity === 0) return 'out-of-stock';
    if (product.quantity <= product.minStock) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusText = (product) => {
    if (product.quantity === 0) return 'Tükendi';
    if (product.quantity <= product.minStock) return 'Düşük Stok';
    return 'Stokta';
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock': return 'text-red-600 bg-red-100';
      case 'low-stock': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Stok bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stok Yönetimi</h1>
              <p className="mt-2 text-gray-600">Ürün stoklarını görüntüleyin ve yönetin</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddProductForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Ürün Ekle
              </button>
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Admin Paneline Dön
              </Link>
            </div>
          </div>
        </div>

        {/* Add Product Form Modal */}
        {showAddProductForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Ürün Ekle</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ürün Adı</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ürün adını girin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fiyat (Kuruş)</label>
                    <input
                      type="number"
                      value={newProduct.priceCents}
                      onChange={(e) => setNewProduct({...newProduct, priceCents: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Fiyatı kuruş cinsinden girin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Başlangıç Stok Miktarı</label>
                    <input
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Stok miktarını girin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Stok</label>
                    <input
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Minimum stok miktarını girin"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddProductForm(false);
                      setNewProduct({
                        name: '',
                        priceCents: '',
                        quantity: '',
                        minStock: '5',
                        categoryId: ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    İptal
                  </button>
                  <button
                    onClick={addNewProduct}
                    disabled={!newProduct.name || !newProduct.priceCents || !newProduct.categoryId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Ürün Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Ara
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ürün adı ile ara..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Filtrele
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Ürünler ({filteredProducts.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Miktarı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min. Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.category?.name || 'Kategori Yok'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingPrice === product.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={priceUpdate}
                              onChange={(e) => setPriceUpdate(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Kuruş"
                            />
                            <span className="text-xs text-gray-500">kuruş</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">
                            {(product.priceCents / 100).toFixed(2)}₺
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingProduct === product.id ? (
                          <input
                            type="number"
                            value={stockUpdate.quantity}
                            onChange={(e) => setStockUpdate({...stockUpdate, quantity: e.target.value})}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">{product.quantity}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.minStock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(stockStatus)}`}>
                          {getStockStatusText(product)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingProduct === product.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateStock(product.id, stockUpdate.quantity)}
                              className="text-green-600 hover:text-green-900"
                              disabled={!stockUpdate.quantity}
                            >
                              Kaydet
                            </button>
                            <button
                              onClick={() => {
                                setEditingProduct(null);
                                setStockUpdate({ quantity: '', amount: '' });
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              İptal
                            </button>
                          </div>
                        ) : editingPrice === product.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updatePrice(product.id, priceUpdate)}
                              className="text-green-600 hover:text-green-900"
                              disabled={!priceUpdate}
                            >
                              Kaydet
                            </button>
                            <button
                              onClick={() => {
                                setEditingPrice(null);
                                setPriceUpdate('');
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product.id);
                                setStockUpdate({ quantity: product.quantity.toString(), amount: '' });
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Stok Düzenle
                            </button>
                            <button
                              onClick={() => {
                                setEditingPrice(product.id);
                                setPriceUpdate(product.priceCents.toString());
                              }}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Fiyat Düzenle
                            </button>
                            <button
                              onClick={() => {
                                const amount = prompt('Eklenecek miktar:');
                                if (amount && parseInt(amount) > 0) {
                                  addStock(product.id, amount);
                                }
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Stok Ekle
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-4m-4 0H9m-4 0h4m0 0V9a2 2 0 012-2h2a2 2 0 012 2v4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ürün bulunamadı</h3>
              <p className="mt-1 text-sm text-gray-500">
                Arama kriterlerinize uygun ürün bulunamadı.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagement;