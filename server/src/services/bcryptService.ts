import bcrypt from 'bcrypt'
import crypto from 'crypto'

export default class BcryptService {
  static hashPassword(password: string): string {
    const saltRounds = 10
    const salt = bcrypt.genSaltSync(saltRounds)
    const hashedPassword = bcrypt.hashSync(password, salt)
    return hashedPassword
  }

  static comparePassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword)
  }

  static createPasswordResetToken(
    passwordResetToken: string | null,
    passwordResetExpires: number | null,
  ) {
    const resetToken = crypto.randomBytes(32).toString('hex')
    passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')
    passwordResetExpires = Date.now() + 30 * 60 * 1000 // 10 minutes
  }
}
