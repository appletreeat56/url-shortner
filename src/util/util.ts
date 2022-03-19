import * as crypto from "crypto";
import { S3 } from "aws-sdk";
import { downloadFromS3, s3Select, uploadToS3 } from "./awsWrapper";

export interface shortUrl {
  id: string;
  url: string;
}

export const addToMasterFile = async (shortURL: shortUrl) => {
  const masterFile: S3.GetObjectOutput = await downloadFromS3({
    Bucket: process.env.SHORT_URL_BUCKET,
    Key: process.env.SHORT_URL_MASTER_FILE,
  });

  const data: Array<shortUrl> = JSON.parse(masterFile.Body.toString());
  data.push(shortURL);

  await uploadToS3({
    Bucket: process.env.SHORT_URL_BUCKET,
    Key: process.env.SHORT_URL_MASTER_FILE,
    Body: JSON.stringify(data),
  });
};

export const generateShortURL = async (url: string) => {
  const md5Hasher = crypto.createHmac(
    "md5",
    Buffer.from(Math.random().toString()).toString("base64").substring(10, 5)
  );

  // hash the string
  const hash: string = md5Hasher.update(url).digest("hex");
  const shortURL: string = hash.substring(0, 6);

  //Check if this is unique
  const result: any = await searchS3Object(shortURL);

  //Match found, need to create a new hash and try again
  if (typeof result === "object" && result.length) {
    return await generateShortURL(url);
  }

  return shortURL;
};

export const searchS3Object = async (shortURL: string) => {
  const params: S3.SelectObjectContentRequest = {
    Bucket: process.env.SHORT_URL_BUCKET,
    Key: process.env.SHORT_URL_MASTER_FILE,
    ExpressionType: "SQL",
    Expression: `select * from s3object[*][*] s where s.id = '${shortURL}'  limit 1`,
    InputSerialization: {
      JSON: {
        Type: "Lines",
      },
    },
    OutputSerialization: {
      JSON: { RecordDelimiter: "," },
    },
  };

  return await s3Select(params);
};

export const searchS3ObjectCSV = async (shortURL: string) => {
  const params: S3.SelectObjectContentRequest = {
    Bucket: process.env.SHORT_URL_BUCKET,
    Key: process.env.SHORT_URL_MASTER_FILE,
    ExpressionType: "SQL",
    Expression: `select url from s3object s where s.id = '${shortURL}'  limit 1`,
    InputSerialization: {
      CSV: {
        FileHeaderInfo: "USE",
        RecordDelimiter: "\n",
        FieldDelimiter: ",",
      },
    },
    OutputSerialization: {
      CSV: {},
    },
  };

  return await s3Select(params);
};
