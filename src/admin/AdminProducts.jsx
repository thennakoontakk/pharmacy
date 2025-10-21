import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import './admin.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchProducts(); // Refresh the list
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingProduct 
        ? `http://localhost:3001/api/products/${editingProduct.id}`
        : 'http://localhost:3001/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProduct(null);
        fetchProducts(); // Refresh the list
      } else {
        const error = await response.json();
        alert('Failed to save product: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const formatPrice = (price) => {
    return price ? `$${parseFloat(price).toFixed(2)}` : 'N/A';
  };

  const formatImages = (images) => {
    if (!images) return 'No images';
    
    try {
      const imageArray = typeof images === 'string' ? JSON.parse(images) : images;
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        return (
          <div className="product-images">
            <img 
              src={`http://localhost:3001${imageArray[0]}`} 
              alt="Product" 
              className="product-thumbnail"
              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
            />
            {imageArray.length > 1 && (
              <span className="image-count">+{imageArray.length - 1}</span>
            )}
          </div>
        );
      }
    } catch (e) {
      console.error('Error parsing images:', e);
    }
    
    return 'No images';
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h1>Product Management</h1>
        <button className="admin-add" onClick={handleAddProduct}>
          Add New Product
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Brand</th>
              <th>New Price</th>
              <th>Old Price</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Koko Pay</th>
              <th>Mint Pay</th>
              <th>Last Edited</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{formatImages(product.images)}</td>
                <td>{product.title}</td>
                <td className="description-cell">
                  {product.description ? 
                    (product.description.length > 50 ? 
                      product.description.substring(0, 50) + '...' : 
                      product.description
                    ) : 'No description'
                  }
                </td>
                <td>{product.brand || 'N/A'}</td>
                <td>{formatPrice(product.price)}</td>
                <td>{formatPrice(product.oldPrice)}</td>
                <td>{product.discount ? `${product.discount}%` : 'N/A'}</td>
                <td>
                  <span className={`stock-badge ${product.stock <= 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${product.kokoPay ? 'available' : 'unavailable'}`}>
                    {product.kokoPay ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${product.mintPay ? 'available' : 'unavailable'}`}>
                    {product.mintPay ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  {product.updated_at ? 
                    new Date(product.updated_at).toLocaleDateString() : 
                    'N/A'
                  }
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>No products found. Add your first product to get started!</p>
        </div>
      )}

      <ProductForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default AdminProducts;