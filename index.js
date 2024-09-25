const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Allowed file types
const allowedFileTypes = /jpeg|jpg|png|gif/

const app = express()
const port = 5000
const host = `http://localhost:${port}`

// Create /images directory if it doesn't exist
const dir = './images'
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: './images',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`.toLowerCase())
  },
})

// File filter to validate file type
const fileFilter = (req, file, cb) => {
  const extname = allowedFileTypes.test(
    path.extname(file.originalname).toLowerCase(),
  )
  const mimetype = allowedFileTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('Error: Images Only!')
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter,
})

// Middleware to serve static files from the images directory
app.use('/images', express.static(path.join(__dirname, 'images')))

// Upload route
app.post('/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message })
    } else if (err) {
      return res.status(400).json({ message: err })
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: 'No file uploaded or invalid file type.' })
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json({
      message: 'File uploaded successfully!',
      url: `${host}/images/${req.file.filename}`,
      filename: req.file.originalname,
    })
  })
})

app.listen(port, () => {
  console.log(`Server is running on ${host}`)
})
