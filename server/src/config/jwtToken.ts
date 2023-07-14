import jwt, { Secret } from 'jsonwebtoken'

export default function generateJsonWebToken(id: string) {
  const secret: Secret = process.env.JWT_SECRET as Secret
  return jwt.sign({ id }, secret, { expiresIn: '3d' })
}
