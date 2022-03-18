import {
  APIGatewayEvent,
  APIGatewayProxyCallback,
  APIGatewayProxyHandler,
  Handler,
} from "aws-lambda";
import "source-map-support/register";
import { badRequest, errorResponse } from "./src/util/responses";
import {
  addToMasterFile,
  generateShortURL,
  searchS3Object,
  shortUrl,
} from "./src/util/util";

export const shortenURL: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
  _context
) => {
  try {

    if (!event?.queryStringParameters["url"]) return badRequest;

    let url = event.queryStringParameters["url"];

    const pattern = new RegExp('^(https?|http)://');

    if(!pattern.test(url)) {
        url = `http://${url}`;
    }

    //Generate short url
    const urlID: string = await generateShortURL(url);

    const shortURL: shortUrl = {
      id: urlID,
      url,
    };

    //APPEND TO MASTER S3 OBJECT
    await addToMasterFile(shortURL);

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          shortURL,
        },
        null,
        2
      ),
    };
  } catch (error) {
    console.log(error);
    return errorResponse(error);
  }
};

export const redirectURL: Handler = async (
  event: APIGatewayEvent,
  _context,
  callback: APIGatewayProxyCallback
) => {
  try {
    const id: string = event.pathParameters["id"];

    if (!id) return badRequest;

    const result: any = await searchS3Object(id);
    console.log(result);

    if (typeof result === "object" && result.length) {
      console.log(result[0].url);

      return callback(null, {
        statusCode: 301,
        headers: {
          Location: `${result[0].url}`,
        },
        body: null,
      });
    }

    return {
      statusCode: 404,
      body: JSON.stringify(
        {
          message: `No matching url found for ${id}`,
        },
        null,
        2
      ),
    };
  } catch (error) {
    console.log(error);
    return errorResponse(error);
  }
};
