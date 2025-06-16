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
  if (!req.file) return next()

  try {
    const webpFilename = `${Date.now()}.webp`
    await sharp(req.file.buffer)
      .webp({ quality: 80 })
      .toFile(`uploads/${webpFilename}`)

    req.file.filename = webpFilename
    req.file.path = `uploads/${webpFilename}`

    next()
  } catch (err) {
    next(err)
  }
}

export { upload, convertToWebP }
