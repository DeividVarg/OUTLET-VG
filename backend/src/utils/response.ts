import { responseType } from '../../types/types'

export const response = ({ res, code, message, data = null }: responseType) => {
  res.status(code).json({
    success: code >= 200 && code < 300,
    message,
    data,
  })
}
