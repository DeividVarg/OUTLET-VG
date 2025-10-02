import { Response } from 'express'
export type responseType = {
  res: Response
  code: number
  message: string
  data?: object | any[] | null
  error?: any
}
