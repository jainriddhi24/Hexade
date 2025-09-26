import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION || 'us-east-1',
})

const BUCKET_NAME = process.env.S3_BUCKET || 'hexade-documents'

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

export interface DocumentMetadata {
  originalName: string
  mimeType: string
  size: number
  uploadedBy: string
  caseId?: string
  version?: number
}

function safeMetadataValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return String(value)
}

export async function uploadDocument(
  file: Buffer,
  metadata: DocumentMetadata
): Promise<UploadResult> {
  try {
    const fileExtension = metadata.originalName.split('.').pop()
    const fileName = `${metadata.caseId || 'general'}/${uuidv4()}.${fileExtension}`
    
    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: metadata.mimeType,
      Metadata: {
        originalName: safeMetadataValue(metadata.originalName),
        uploadedBy: safeMetadataValue(metadata.uploadedBy),
        caseId: safeMetadataValue(metadata.caseId || ''),
        version: safeMetadataValue(metadata.version?.toString() || '1'),
        uploadedAt: new Date().toISOString(),
        mimeType: safeMetadataValue(metadata.mimeType),
        size: safeMetadataValue(metadata.size),
      },
    }

    const result = await s3.upload(params).promise()
    
    return {
      success: true,
      url: (result as any).Location,
      key: (result as any).Key,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export async function deleteDocument(key: string): Promise<UploadResult> {
  try {
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: key,
    }).promise()
    
    return { success: true }
  } catch (error) {
    console.error('S3 delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    })
    
    return url
  } catch (error) {
    console.error('S3 signed URL error:', error)
    throw new Error('Failed to generate download URL')
  }
}

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn,
    })
    
    return url
  } catch (error) {
    console.error('S3 presigned URL error:', error)
    throw new Error('Failed to generate upload URL')
  }
}

// Document versioning
export async function createDocumentVersion(
  originalKey: string,
  newFile: Buffer,
  metadata: DocumentMetadata
): Promise<UploadResult> {
  try {
    const fileExtension = metadata.originalName.split('.').pop()
    const versionKey = `${originalKey.split('.')[0]}_v${metadata.version}.${fileExtension}`
    
    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: versionKey,
      Body: newFile,
      ContentType: metadata.mimeType,
      Metadata: {
        isVersion: 'true',
        originalKey: safeMetadataValue(originalKey),
        versionedAt: new Date().toISOString(),
        originalName: safeMetadataValue(metadata.originalName),
        mimeType: safeMetadataValue(metadata.mimeType),
        size: safeMetadataValue(metadata.size),
        uploadedBy: safeMetadataValue(metadata.uploadedBy),
        caseId: safeMetadataValue(metadata.caseId || ''),
        version: safeMetadataValue(metadata.version),
      },
    }

    const result = await s3.upload(params).promise()
    
    return {
      success: true,
      url: (result as any).Location,
      key: (result as any).Key,
    }
  } catch (error) {
    console.error('S3 version upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Version upload failed',
    }
  }
}

// E-signature functionality
export interface ESignatureData {
  signerName: string
  signerEmail: string
  signatureData: string // Base64 encoded signature
  documentKey: string
  caseId: string
}

export async function addSignatureToDocument(
  signatureData: ESignatureData
): Promise<UploadResult> {
  try {
    const signatureKey = `${signatureData.documentKey}_signed_${Date.now()}`

    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: signatureKey,
      Body: Buffer.from('SIGNED_DOCUMENT_PLACEHOLDER'),
      ContentType: 'application/pdf',
      Metadata: {
        originalDocument: safeMetadataValue(signatureData.documentKey),
        signerName: safeMetadataValue(signatureData.signerName),
        signerEmail: safeMetadataValue(signatureData.signerEmail),
        signedAt: new Date().toISOString(),
        caseId: safeMetadataValue(signatureData.caseId),
        isSigned: 'true',
      },
    }

    const result = await s3.upload(params).promise()
    
    return {
      success: true,
      url: (result as any).Location,
      key: (result as any).Key,
    }
  } catch (error) {
    console.error('E-signature error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'E-signature failed',
    }
  }
}
