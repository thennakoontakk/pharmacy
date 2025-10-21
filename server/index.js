import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

dotenv.config()

const app = express()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

app.use(cors())
app.use(express.json())

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmacy',
}

let pool

async function ensureDatabase() {
  const conn = await mysql.createConnection({ host: dbConfig.host, user: dbConfig.user, password: dbConfig.password })
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
  await conn.end()
}

async function initDb() {
  await ensureDatabase()
  pool = await mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10, queueLimit: 0 })
  const conn = await pool.getConnection()
  try {
    // Create table with all required columns
    await conn.query(`CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      image VARCHAR(255) NULL,
      images TEXT NULL,
      brand VARCHAR(100) NULL,
      price DECIMAL(10,2) NOT NULL,
      oldPrice DECIMAL(10,2) NULL,
      discount DECIMAL(5,2) NULL,
      discountBadge VARCHAR(50) NULL,
      stock INT DEFAULT 0,
      kokoPay BOOLEAN DEFAULT FALSE,
      mintPay BOOLEAN DEFAULT FALSE,
      outOfStock BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    // Add missing columns if they don't exist (for existing databases)
    const addColumnIfNotExists = async (columnName, columnDefinition) => {
      try {
        await conn.query(`ALTER TABLE products ADD COLUMN ${columnName} ${columnDefinition}`)
        console.log(`Added missing column: ${columnName}`)
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          console.log(`Column ${columnName} already exists or error:`, error.message)
        }
      }
    }

    // Ensure all columns exist
    await addColumnIfNotExists('description', 'TEXT NULL')
    await addColumnIfNotExists('image', 'VARCHAR(255) NULL')
    await addColumnIfNotExists('images', 'TEXT NULL')
    await addColumnIfNotExists('brand', 'VARCHAR(100) NULL')
    await addColumnIfNotExists('oldPrice', 'DECIMAL(10,2) NULL')
    await addColumnIfNotExists('discount', 'DECIMAL(5,2) NULL')
    await addColumnIfNotExists('discountBadge', 'VARCHAR(50) NULL')
    await addColumnIfNotExists('stock', 'INT DEFAULT 0')
    await addColumnIfNotExists('kokoPay', 'BOOLEAN DEFAULT FALSE')
    await addColumnIfNotExists('mintPay', 'BOOLEAN DEFAULT FALSE')
    await addColumnIfNotExists('outOfStock', 'BOOLEAN DEFAULT FALSE')

    const [rows] = await conn.query('SELECT COUNT(*) as cnt FROM products')
    if (rows[0].cnt === 0) {
      // Seed initial data
      const initialProducts = [
        {
          title: 'Paracetamol 500mg',
          description: 'Pain relief and fever reducer tablets',
          image: '/api/placeholder/300/200',
          images: JSON.stringify(['/api/placeholder/300/200', '/api/placeholder/300/201']),
          brand: 'Generic',
          price: 5.99,
          oldPrice: 7.99,
          discount: 25,
          discountBadge: '25% OFF',
          stock: 150,
          kokoPay: true,
          mintPay: true,
          outOfStock: false
        },
        {
          title: 'Vitamin C 1000mg',
          description: 'Immune system support supplement',
          image: '/api/placeholder/300/202',
          images: JSON.stringify(['/api/placeholder/300/202']),
          brand: 'VitaHealth',
          price: 12.50,
          oldPrice: null,
          discount: null,
          discountBadge: null,
          stock: 75,
          kokoPay: true,
          mintPay: false,
          outOfStock: false
        },
        {
          title: 'Antiseptic Cream',
          description: 'Topical antiseptic for minor cuts and wounds',
          image: '/api/placeholder/300/203',
          images: JSON.stringify(['/api/placeholder/300/203', '/api/placeholder/300/204']),
          brand: 'MedCare',
          price: 8.25,
          oldPrice: 10.00,
          discount: 17.5,
          discountBadge: 'SALE',
          stock: 0,
          kokoPay: false,
          mintPay: true,
          outOfStock: true
        }
      ];
      
      for (const product of initialProducts) {
        await conn.query(
          'INSERT INTO products (title, description, image, images, brand, price, oldPrice, discount, discountBadge, stock, kokoPay, mintPay, outOfStock) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
          [product.title, product.description, product.image, product.images, product.brand, product.price, product.oldPrice, product.discount, product.discountBadge, product.stock, product.kokoPay, product.mintPay, product.outOfStock]
        )
      }
    }

    // Admins table
    await conn.query(`CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(100) NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)
    const [adminRows] = await conn.query('SELECT COUNT(*) as cnt FROM admins')
    if (adminRows[0].cnt === 0) {
      const defaultEmail = 'admin@pharmacy.test'
      const defaultName = 'Admin'
      const defaultPassword = 'admin123' // For development only; change in production
      const hash = await bcrypt.hash(defaultPassword, 10)
      await conn.query('INSERT INTO admins (email, name, password_hash) VALUES (?,?,?)', [defaultEmail, defaultName, hash])
      console.log('Seeded default admin: ', defaultEmail)
    }

    // Users table for public authentication
    await conn.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(100) NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

    // User cart_items table for shopping cart
    await conn.query(`CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_product (user_id, product_id)
    )`)

    // Posters table
    await conn.query(`CREATE TABLE IF NOT EXISTS posters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      image_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    // Blogs table
    await conn.query(`CREATE TABLE IF NOT EXISTS blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      thumbnail_path VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)
  } finally {
    conn.release()
  }
}

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')
    req.admin = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  const [rows] = await pool.query('SELECT * FROM admins WHERE email=?', [email])
  const admin = rows[0]
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, admin.password_hash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ adminId: admin.id, email: admin.email, name: admin.name }, process.env.JWT_SECRET || 'dev_secret_change_me', { expiresIn: '2h' })
  res.json({ token })
})

// Public user registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const [result] = await pool.query('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)', [name || null, email, hash])
    const token = jwt.sign({ userId: result.insertId, email, name: name || '' }, process.env.JWT_SECRET || 'dev_secret_change_me', { expiresIn: '7d' })
    res.json({ token, user: { id: result.insertId, name: name || '', email } })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Failed to register' })
  }
})

// Public user login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name || '' }, process.env.JWT_SECRET || 'dev_secret_change_me', { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name || '', email: user.email } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Failed to login' })
  }
})

app.get('/api/products', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC')
  res.json(rows)
})

// Image upload endpoint
app.post('/api/upload', authenticate, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const filePaths = req.files.map(file => `/uploads/${file.filename}`);
    res.json({ success: true, filePaths });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Add product
app.post('/api/products', authenticate, async (req, res) => {
  try {
    console.log('POST /api/products - Request body:', req.body);
    console.log('POST /api/products - Admin:', req.admin);
    
    const { title, description, image, images, brand, price, oldPrice, discount, discountBadge, stock, kokoPay, mintPay, outOfStock } = req.body;
    
    // Handle images array - convert to JSON string if it's an array
    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : images;
    
    console.log('POST /api/products - Processed data:', {
      title, description, image, imagesStr, brand, price, oldPrice, discount, discountBadge, stock, kokoPay, mintPay, outOfStock
    });
    
    const [result] = await pool.query(
      'INSERT INTO products (title, description, image, images, brand, price, oldPrice, discount, discountBadge, stock, kokoPay, mintPay, outOfStock) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [title, description, image, imagesStr, brand, price, oldPrice, discount, discountBadge, stock, kokoPay, mintPay, outOfStock]
    );
    
    console.log('POST /api/products - Insert result:', result);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product', details: error.message });
  }
});

// Update product
app.put('/api/products/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, images, brand, price, oldPrice, discount, discountBadge, stock, kokoPay, mintPay, outOfStock } = req.body;
    
    // Handle images array - convert to JSON string if it's an array
    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : images;
    
    await pool.query(
      'UPDATE products SET title=?, description=?, image=?, images=?, brand=?, price=?, oldPrice=?, discount=?, discountBadge=?, stock=?, kokoPay=?, mintPay=?, outOfStock=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [title, description, image, imagesStr, brand, price, oldPrice, discount, discountBadge, stock, kokoPay, mintPay, outOfStock, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
})

app.delete('/api/products/:id', authenticate, async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE FROM products WHERE id=?', [id])
  res.json({ ok: true })
})

// Poster endpoints
app.get('/api/posters', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posters ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching posters:', error)
    res.status(500).json({ error: 'Failed to fetch posters' })
  }
})

// Public endpoint to fetch posters for frontend display
app.get('/api/public/posters', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posters ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching posters:', error)
    res.status(500).json({ error: 'Failed to fetch posters' })
  }
})

// Configure multer for poster uploads with custom naming
const posterStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Get the next poster number
    pool.query('SELECT COUNT(*) as count FROM posters')
      .then(([rows]) => {
        const posterNumber = rows[0].count + 1;
        const posterName = `poster ${posterNumber.toString().padStart(2, '0')}`;
        const extension = path.extname(file.originalname);
        cb(null, posterName + extension);
      })
      .catch(err => {
        console.error('Error getting poster count:', err);
        cb(err);
      });
  }
});

const posterUpload = multer({ 
  storage: posterStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

app.post('/api/posters/upload', authenticate, posterUpload.single('poster'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract poster name from filename (without extension)
    const posterName = path.parse(req.file.filename).name;
    const imagePath = `/uploads/${req.file.filename}`;

    // Save to database
    const [result] = await pool.query(
      'INSERT INTO posters (name, image_path) VALUES (?, ?)',
      [posterName, imagePath]
    );

    res.json({ 
      success: true, 
      id: result.insertId,
      name: posterName,
      image_path: imagePath
    });
  } catch (error) {
    console.error('Error uploading poster:', error);
    res.status(500).json({ error: 'Failed to upload poster' });
  }
});

app.delete('/api/posters/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get poster info before deleting
    const [rows] = await pool.query('SELECT * FROM posters WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Poster not found' });
    }
    
    const poster = rows[0];
    
    // Delete from database
    await pool.query('DELETE FROM posters WHERE id = ?', [id]);
    
    // Delete file from filesystem
    const filePath = path.join(uploadsDir, path.basename(poster.image_path));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting poster:', error);
    res.status(500).json({ error: 'Failed to delete poster' });
  }
});

// Public endpoint to fetch latest blogs for frontend display
app.get('/api/public/blogs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC LIMIT 6')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    res.status(500).json({ error: 'Failed to fetch blogs' })
  }
})

// Blog endpoints
app.get('/api/blogs', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM blogs ORDER BY id DESC')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    res.status(500).json({ error: 'Failed to fetch blogs' })
  }
})

app.post('/api/blogs', authenticate, async (req, res) => {
  try {
    const { title, description, thumbnail_path } = req.body
    if (!title || !description || !thumbnail_path) {
      return res.status(400).json({ error: 'Title, description, and thumbnail_path are required' })
    }

    const [result] = await pool.query(
      'INSERT INTO blogs (title, description, thumbnail_path) VALUES (?, ?, ?)',
      [title, description, thumbnail_path]
    )

    res.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error('Error adding blog:', error)
    res.status(500).json({ error: 'Failed to add blog' })
  }
})

app.delete('/api/blogs/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query('SELECT * FROM blogs WHERE id=?', [id])
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' })
    }
    const blog = rows[0]

    await pool.query('DELETE FROM blogs WHERE id=?', [id])

    const filePath = path.join(uploadsDir, path.basename(blog.thumbnail_path))
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog:', error)
    res.status(500).json({ error: 'Failed to delete blog' })
  }
})

// Add user cart middleware for JWT containing userId
function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'] || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')
    if (!payload.userId) return res.status(401).json({ error: 'Invalid user token' })
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Create cart_items table during DB init
// This block should be placed inside initDb after users table creation
// (Adding here via patch pattern for clarity)
app.get('/api/cart', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId
    const [rows] = await pool.query(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.title, p.price, p.oldPrice, p.image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.id DESC
    `, [userId])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching cart:', error)
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

app.post('/api/cart', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId
    const { productId, quantity } = req.body
    if (!productId) return res.status(400).json({ error: 'productId required' })
    const qty = Number(quantity || 1)

    const [existing] = await pool.query('SELECT id, quantity FROM cart_items WHERE user_id=? AND product_id=?', [userId, productId])
    if (existing.length > 0) {
      const current = existing[0]
      await pool.query('UPDATE cart_items SET quantity=? WHERE id=?', [current.quantity + qty, current.id])
      return res.json({ success: true, id: current.id, quantity: current.quantity + qty })
    }

    const [result] = await pool.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?,?,?)', [userId, productId, qty])
    res.json({ success: true, id: result.insertId, quantity: qty })
  } catch (error) {
    console.error('Error adding to cart:', error)
    res.status(500).json({ error: 'Failed to add to cart' })
  }
})

app.put('/api/cart/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params
    const { quantity } = req.body
    if (quantity == null) return res.status(400).json({ error: 'quantity required' })
    await pool.query('UPDATE cart_items SET quantity=? WHERE id=? AND user_id=?', [Number(quantity), id, userId])
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating cart item:', error)
    res.status(500).json({ error: 'Failed to update cart item' })
  }
})

app.delete('/api/cart/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId
    const { id } = req.params
    await pool.query('DELETE FROM cart_items WHERE id=? AND user_id=?', [id, userId])
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting cart item:', error)
    res.status(500).json({ error: 'Failed to delete cart item' })
  }
})

const PORT = process.env.PORT || 3001
initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}).catch(err => {
  console.error('Failed to init DB', err)
  process.exit(1)
})