import { User } from '@prisma/client'
import jwt, { Secret } from 'jsonwebtoken'

export default function generateJsonWebToken({ id }: User) {
  const secret: Secret = process.env.JWT_SECRET as Secret
  return jwt.sign({ id }, secret, { expiresIn: '1d' })
}

export const validateAccessToken = (token: string) => {
  try {
    const userData = jwt.verify(token, process.env.JWT_SECRET as Secret)
    return userData
  } catch (e) {
    return null
  }
}
