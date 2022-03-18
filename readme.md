# URL Shortner

This is a lambda function written using serverless framework (https://www.serverless.com/). This function will do the following -

* Given a url, it will generate a short id and add it to a s3 bucket
* Given a shortID, it will redirect it to the target URL


This repo uses these packages - 
* aws-sdk: AWS SDK for JavaScript
* serverless-offline: This Serverless plugin emulates AWS λ and API Gateway on your local machine to speed up your development cycles


# Install

```javascript
   npm install 
```

# Run
```javascript
   sls offline
```
# deploy

Make sure that you have AWS access and secret key with correct permission set in the environment before you run this.

```javascript
   sls deploy --stage [dev][prod] --region[any-aws-region-of-you-choice] 
```


