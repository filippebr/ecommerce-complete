import { User } from '@prisma/client'
import jwt, { Secret } from 'jsonwebtoken'

export default function generateJsonWebToken(id: User) {
  const secret: Secret = process.env.JWT_SECRET as Secret
  return jwt.sign({ id }, secret, { expiresIn: '3d' })
}
