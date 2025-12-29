declare module 'aws-sdk' {
  export namespace S3 {
    interface PutObjectRequest {
      Bucket: string;
      Key: string;
      Body: any;
      ContentType?: string;
      [key: string]: any;
    }
    interface GetObjectRequest {
      Bucket: string;
      Key: string;
      [key: string]: any;
    }
    interface DeleteObjectRequest {
      Bucket: string;
      Key: string;
      [key: string]: any;
    }
  }
  
  export class S3 {
    constructor(options?: any);
    putObject(params: S3.PutObjectRequest, callback?: (err: any, data: any) => void): any;
    getObject(params: S3.GetObjectRequest, callback?: (err: any, data: any) => void): any;
    deleteObject(params: S3.DeleteObjectRequest, callback?: (err: any, data: any) => void): any;
    [key: string]: any;
  }
  
  const awsSdk: {
    S3: typeof S3;
    [key: string]: any;
  };
  
  export default awsSdk;
}
