import { google } from 'googleapis'

function requireDriveEnv() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  if (!clientEmail || !privateKey || !folderId) {
    throw new Error('Google Drive env is not configured')
  }

  return { clientEmail, privateKey, folderId }
}

export function getDriveClient() {
  const { clientEmail, privateKey } = requireDriveEnv()
  return google.drive({
    version: 'v3',
    auth: new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive'],
    }),
  })
}

export async function uploadImageToDrive(file: File) {
  const { folderId } = requireDriveEnv()
  const drive = getDriveClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const filename = file.name || `photo-${Date.now()}`

  const createResponse = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: file.type || 'application/octet-stream',
      body: buffer,
    },
    fields: 'id',
  })

  const fileId = createResponse.data.id
  if (!fileId) {
    throw new Error('Google Drive upload did not return a file id')
  }

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  return {
    driveFileId: fileId,
    publicUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
  }
}
