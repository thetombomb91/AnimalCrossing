const AWS = require('aws-sdk');
const s3 = new AWS.S3()
const bucketName = "animal-xing-img-testing-528";

const waterfall = require('async-waterfall');
const { uuid } = require('uuidv4');

function createBucket(bucketsList, callback) {
    if (bucketsList.some(b => b['Name'] === bucketName)) {
        callback();
        return
    }

    const parameters = {
        Bucket: bucketName
    }

    s3.createBucket(parameters, (error, data) => {
        callback(error);
    });
}

function getSignedUlr(callback) {
    const key = uuid();
    const s3Params = {
        Bucket: bucketName,
        Key: `${key}.jpg`,
        ContentType: 'image/jpeg'
    }

    s3.getSignedUrl('putObject', s3Params, (error, signedUrl) => {
        callback(error, signedUrl, key);
    });
}

function getAllS3Buckets(callback) {
    s3.listBuckets({}, (err, listOfBuckets) => {
        callback(err, listOfBuckets);
    });
}

exports.handler = (event, context, callback) => {
    const tasks = [
        (taskComplete) => getAllS3Buckets(taskComplete),
        (listBucketsResults, taskComplete) => createBucket(listBucketsResults['Buckets'], taskComplete),
        (taskComplete) => getSignedUlr(taskComplete)
    ];

    waterfall(tasks, (error, signedUrl, key) => {
        const results = {
            signedUrl: signedUrl,
            key: key
        }
        callback(error, results)
    });
};