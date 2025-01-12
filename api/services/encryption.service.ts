import crypto from 'crypto'
const ALGORITHM = 'aes-256-cbc'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

export const encrypt = ({
  buffer,
}: {
  buffer: Buffer
}): { encryptedData: string; iv: string } => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )

  const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()])

  return {
    encryptedData: encryptedData.toString('base64'),
    iv: iv.toString('base64'),
  }
}

export const decrypt = (encryptedData: string, iv: string): Buffer => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'base64')
  )

  const decryptedData = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'base64')),
    decipher.final(),
  ])

  return decryptedData
}
