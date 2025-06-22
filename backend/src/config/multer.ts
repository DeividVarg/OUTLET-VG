import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { Request, NextFunction, Response } from 'express'

type File = Express.Multer.File

const storage = multer.memoryStorage()

const fileFilter = (req: Request, file: File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Solo imágenes permitidas'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
})

const convertToWebP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) return next()

  const uploadDir = path.join(__dirname, '..', '..', 'uploads')

  try {
    // Crear la carpeta si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const convertedFiles: string[] = []

    for (const file of files) {
      const timestamp = Date.now()
      const cleanName = file.originalname.split('.')[0]
      const webpFilename = `${timestamp}-${cleanName}.webp`
      const outputPath = path.join(uploadDir, webpFilename)

      await sharp(file.buffer).webp({ quality: 80 }).toFile(outputPath)

      convertedFiles.push(webpFilename)
    }

    req.body.images = convertedFiles
    next()
  } catch (err) {
    console.error('Error al convertir imágenes:', err)
    next(err)
  }
}

export { upload, convertToWebP }
