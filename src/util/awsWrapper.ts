import { S3, AWSError } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function downloadFromS3(
    params: S3.GetObjectRequest
  ): Promise<any> {
    console.info("---- DOWNLOADING FROM S3", JSON.stringify(params, null, 2));
    try {
      return await s3.getObject(params).promise();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

export async function uploadToS3(s3Data: S3.PutObjectRequest) {
    console.info(
      "---- UPLODAING TO S3",
      JSON.stringify(`${s3Data.Bucket} ${s3Data.Key}`, null, 2)
    );
  
    try {
      return await s3.upload(s3Data).promise();
    } catch (error) {
      console.log(error);
      return error;
    }
}


export async function getS3SignedUrl(params: any): Promise<any> {
    console.info(
      "---- GETTING SIGNED URL FROM S3",
      JSON.stringify(params, null, 2)
    );
    try {
      return s3.getSignedUrl("getObject", {
        Bucket: params.Bucket,
        Key: params.Key,
        Expires: params.Expires,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
}

export async function s3Select(params: S3.SelectObjectContentRequest) {
    return new Promise((resolve, reject) => {
      s3.selectObjectContent(params, (err:AWSError, data:any) => {
        if (err) {
          reject(err);
        }
  
        if (!data) {
          reject("Empty data object");
        }
  
        // This will be an array of bytes of data, to be converted
        // to a buffer
        const records = [];
        
        //This is a stream of events
        data.Payload.on("data", (event:any) => {
          // There are multiple events in the eventStream, but all we
          // care about are Records events. If the event is a Records
          // event, there is data inside it
          if (event.Records) {
            records.push(event.Records.Payload);
          }
        })
          .on("error", (err:any) => {
            reject(err);
          })
          .on("end", () => {
            // Convert the array of bytes into a buffer, and then
            // convert that to a string
            let result: any[] = JSON.parse(`[${Buffer.concat(records).toString("utf8").replace(/\,$/, '')}]`);  
            resolve(result);
          });
      });
    });
  }