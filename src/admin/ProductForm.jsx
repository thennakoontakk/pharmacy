import React, { useState, useEffect } from 'react';
import './admin.css';

const ImageUpload = ({ images, onImagesChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        const newImages = [...images, ...result.filePaths];
        onImagesChange(newImages);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="image-upload-container">
      <div 
        className={`image-dropzone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="image-upload" className="upload-label">
          {uploading ? (
            <div>Uploading...</div>
          ) : (
            <div>
              <div className="upload-icon">📁</div>
              <div>Drag & drop images here or click to browse</div>
              <div className="upload-hint">Supports: JPG, PNG, GIF (Max 5MB each)</div>
            </div>
          )}
        </label>
      </div>
      
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((image, index) => (
            <div key={index} className="image-preview-item">
              <img 
                src={`http://localhost:3001${image}`} 
                alt={`Preview ${index + 1}`}
                className="preview-image"
              />
              <button 
                type="button"
                className="remove-image-btn"
                onClick={() => removeImage(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductForm = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    price: '',
    oldPrice: '',
    discount: '',
    discountBadge: '',
    stock: '',
    kokoPay: false,
    mintPay: false,
    outOfStock: false,
    images: []
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        brand: product.brand || '',
        price: product.price || '',
        oldPrice: product.oldPrice || '',
        discount: product.discount || '',
        discountBadge: product.discountBadge || '',
        stock: product.stock || '',
        kokoPay: product.kokoPay || false,
        mintPay: product.mintPay || false,
        outOfStock: product.outOfStock || false,
        images: product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        brand: '',
        price: '',
        oldPrice: '',
        discount: '',
        discountBadge: '',
        stock: '',
        kokoPay: false,
        mintPay: false,
        outOfStock: false,
        images: []
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagesChange = (newImages) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Set primary image to first uploaded image if no primary image exists
    const primaryImage = formData.images.length > 0 ? formData.images[0] : '';
    
    const submitData = {
      ...formData,
      image: primaryImage,
      images: formData.images,
      price: parseFloat(formData.price) || 0,
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
      discount: formData.discount ? parseFloat(formData.discount) : null,
      stock: parseInt(formData.stock) || 0
    };
    
    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <ImageUpload 
              images={formData.images}
              onImagesChange={handleImagesChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>New Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Old Price</label>
              <input
                type="number"
                name="oldPrice"
                value={formData.oldPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Discount Badge</label>
              <input
                type="text"
                name="discountBadge"
                value={formData.discountBadge}
                onChange={handleChange}
                placeholder="e.g., SALE, 25% OFF"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="kokoPay"
                  checked={formData.kokoPay}
                  onChange={handleChange}
                />
                Koko Pay Available
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="mintPay"
                  checked={formData.mintPay}
                  onChange={handleChange}
                />
                Mint Pay Available
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="outOfStock"
                  checked={formData.outOfStock}
                  onChange={handleChange}
                />
                Out of Stock
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;