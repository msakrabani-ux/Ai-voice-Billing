import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import useStore from '../store/useStore';

const Products = () => {
  const { products, setProducts, addProduct, updateProduct, removeProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: ''
  });

  // Fetch products (mocked for now, will connect to backend)
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if(data.data) setProducts(data.data);
      })
      .catch(err => console.error("Error fetching products:", err));
  }, [setProducts]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category || ''
      });
      setEditingId(product.id);
    } else {
      setFormData({ name: '', price: '', stock: '', category: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      category: formData.category
    };

    if (editingId) {
      // Update
      try {
        const res = await fetch(`http://localhost:5000/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if(res.ok) {
          updateProduct(editingId, productData);
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Add new
      try {
        const res = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        const data = await res.json();
        if(data.data) {
          addProduct(data.data);
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE'
        });
        if(res.ok) {
          removeProduct(id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-400 mt-1">Manage your inventory</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-neon-blue flex items-center space-x-2 px-4 py-2 rounded-lg font-medium"
        >
          <MdAdd size={20} />
          <span>Add Product</span>
        </button>
      </header>

      <div className="glass-card flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-md">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products by name or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#00f3ff] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[rgba(25,26,35,0.9)] backdrop-blur-md z-10">
              <tr>
                <th className="p-4 border-b border-[rgba(255,255,255,0.1)] font-medium text-gray-400">ID</th>
                <th className="p-4 border-b border-[rgba(255,255,255,0.1)] font-medium text-gray-400">Name</th>
                <th className="p-4 border-b border-[rgba(255,255,255,0.1)] font-medium text-gray-400">Category</th>
                <th className="p-4 border-b border-[rgba(255,255,255,0.1)] font-medium text-gray-400">Price</th>
                <th className="p-4 border-b border-[rgba(255,255,255,0.1)] font-medium text-gray-400">Stock</th>
                <th className="p-4 border-b border-[rgba(255,255,255,0.1)] font-medium text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors border-b border-[rgba(255,255,255,0.05)]">
                  <td className="p-4 text-gray-400">#{product.id}</td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4"><span className="bg-[rgba(189,0,255,0.1)] text-[#bd00ff] px-2 py-1 rounded-full text-xs">{product.category || 'N/A'}</span></td>
                  <td className="p-4">₹{product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock <= 5 ? 'bg-[rgba(239,68,68,0.1)] text-red-400' : 'bg-[rgba(74,222,128,0.1)] text-green-400'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(product)} className="text-[#00f3ff] hover:bg-[rgba(0,243,255,0.1)] p-2 rounded-lg transition-colors">
                      <MdEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-400 hover:bg-[rgba(239,68,68,0.1)] p-2 rounded-lg transition-colors">
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No products found. Add a product to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 animate-[fadeIn_0.2s_ease-out]">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:border-[#00f3ff]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:border-[#00f3ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Stock Qty</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:border-[#00f3ff]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:border-[#00f3ff]"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 rounded-lg btn-neon-blue"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
