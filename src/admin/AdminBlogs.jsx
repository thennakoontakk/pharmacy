import React, { useEffect, useState } from 'react'
import './admin.css'

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blogs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setBlogs(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch blogs', res.status)
        setBlogs([])
      }
    } catch (err) {
      console.error('Error fetching blogs:', err)
      setBlogs([])
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewUrl(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl('')
    }
  }

  const handleCreateBlog = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please enter a title and description')
      return
    }
    if (!selectedFile) {
      alert('Please select a thumbnail image')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('admin_token')

      // Step 1: upload image to server
      const formData = new FormData()
      formData.append('images', selectedFile)
      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (!uploadRes.ok) {
        alert('Image upload failed')
        setSaving(false)
        return
      }
      const { filePaths } = await uploadRes.json()
      const thumbnail_path = filePaths?.[0]
      if (!thumbnail_path) {
        alert('Upload succeeded but image path missing')
        setSaving(false)
        return
      }

      // Step 2: create blog record
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, thumbnail_path })
      })
      if (res.ok) {
        alert('Blog saved successfully')
        setTitle('')
        setDescription('')
        setSelectedFile(null)
        setPreviewUrl('')
        const inputEl = document.getElementById('blog-thumbnail')
        if (inputEl) inputEl.value = ''
        fetchBlogs()
      } else {
        const errText = await res.text()
        console.error('Save blog failed:', errText)
        alert('Failed to save blog')
      }
    } catch (err) {
      console.error('Error saving blog:', err)
      alert('Failed to save blog')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog?')) return
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        fetchBlogs()
      } else {
        alert('Failed to delete')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete')
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h1>Blogs</h1>
        <button className="admin-add" onClick={handleCreateBlog} disabled={saving}>
          {saving ? 'Saving...' : 'Save Blog'}
        </button>
      </div>

      <div className="admin-form-card">
        <h2>Create New Blog</h2>
        <div className="form-group">
          <label>Blog Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter title" />
        </div>
        <div className="form-group">
          <label>Blog Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter description" />
        </div>
        <div className="form-group">
          <label htmlFor="blog-thumbnail">Thumbnail Image</label>
          <input id="blog-thumbnail" type="file" accept="image/*" onChange={handleFileSelect} />
        </div>

        {previewUrl && (
          <div className="form-group">
            <label>Preview:</label>
            <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'contain' }} />
          </div>
        )}
      </div>

      <div className="admin-form-card">
        <h2>Existing Blogs</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Description</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr><td colSpan="5">No blogs yet.</td></tr>
            ) : (
              blogs.map(blog => (
                <tr key={blog.id}>
                  <td>
                    {blog.thumbnail_path ? (
                      <img src={blog.thumbnail_path ? new URL(blog.thumbnail_path, (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')).toString() : ''} alt={blog.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                    ) : '—'}
                  </td>
                  <td>{blog.title}</td>
                  <td className="description-cell">{blog.description?.length > 60 ? blog.description.slice(0,60) + '…' : blog.description}</td>
                  <td>{new Date(blog.created_at).toLocaleString()}</td>
                  <td className="row-actions">
                    <button onClick={() => handleDelete(blog.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}