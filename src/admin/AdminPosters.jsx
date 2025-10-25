import React, { useState, useEffect } from 'react'
import './admin.css'

export default function AdminPosters() {
  const [posters, setPosters] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    fetchPosters()
  }, [])

  const fetchPosters = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/posters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPosters(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch posters:', response.status)
        setPosters([])
      }
    } catch (error) {
      console.error('Error fetching posters:', error)
      setPosters([])
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreviewUrl(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('poster', selectedFile)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/posters/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Poster uploaded successfully as: ${result.name}`)
        setSelectedFile(null)
        setPreviewUrl('')
        fetchPosters()
        document.getElementById('poster-file').value = ''
      } else {
        alert('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this poster?')) {
      try {
        const token = localStorage.getItem('admin_token')
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/posters/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          alert('Poster deleted successfully')
          fetchPosters()
        } else {
          alert('Delete failed')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Delete failed')
      }
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1>Promotion Cards and Posters</h1>
      </div>

      <div className="admin-form-card">
        <h2>Upload New Poster</h2>
        <div className="form-group">
          <label htmlFor="poster-file">Select Poster Image:</label>
          <input
            id="poster-file"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="form-input"
          />
        </div>

        {previewUrl && (
          <div className="form-group">
            <label>Preview:</label>
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'contain' }} />
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="admin-add"
        >
          {uploading ? 'Uploading...' : 'Upload Poster'}
        </button>
      </div>

      <div className="admin-form-card">
        <h2>Existing Posters</h2>
        <div className="posters-grid">
          {posters.length === 0 ? (
            <p>No posters uploaded yet.</p>
          ) : (
            posters.map((poster) => (
              <div key={poster.id} className="poster-item">
                <img 
                  src={poster.image_path ? new URL(poster.image_path, (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')).toString() : ''}
                  alt={poster.name}
                  className="poster-thumbnail"
                />
                <div className="poster-info">
                  <h3>{poster.name}</h3>
                  <p>Uploaded: {new Date(poster.created_at).toLocaleDateString()}</p>
                  <button
                    onClick={() => handleDelete(poster.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}