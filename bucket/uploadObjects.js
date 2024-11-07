import * as Minio from 'minio';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const minioClient = new Minio.Client({
    endPoint: process.env.ENDPOINT,
    useSSL: true,
    accessKey: process.env.ACCESS_KEY,
    secretKey: process.env.SECRET_KEY
});

const bucket = 'aev-pictures';

// Recursive function to get all image files in a directory
const getImagesFromDirectory = (dirPath) => {
    let results = [];

    // Read directory content
    const list = fs.readdirSync(dirPath);

    list.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat && stat.isDirectory()) {
            // Recurse into subdirectories
            results = results.concat(getImagesFromDirectory(fullPath));
        } else {
            // Only add image files (.jpg, .png)
            if (/\.(jpg|png)$/i.test(file)) {
                results.push(fullPath);
            }
        }
    });

    return results;
};

// Get the highest image index from the bucket
const getHighestImageIndex = async () => {
    let highestIndex = 0;

    try {
        const stream = minioClient.listObjects(bucket, '', true);
        for await (const obj of stream) {
            const match = obj.name.match(/^AEV_PICTURE(\d+)\.(jpg|png)$/);
            if (match) {
                const index = parseInt(match[1], 10);
                if (index > highestIndex) {
                    highestIndex = index;
                }
            }
        }
    } catch (err) {
        console.error('Error listing objects in bucket:', err);
    }

    return highestIndex;
};

// Upload a file to Minio
const uploadImage = async (sourceFile, index) => {
    const fileName = `AEV_PICTURE${index}${path.extname(sourceFile)}`;
    const destinationObject = fileName;
    let metaData = {
        'Content-Type': getContentType(fileName),
        'Original-File-Name': path.basename(sourceFile),
    };

    try {
        const exists = await minioClient.bucketExists(bucket);

        if (exists) {
            console.log('Bucket ' + bucket + ' exists.');
        } else {
            console.log('Bucket ' + bucket + ' doesn\'t exist. Creating...');
            await minioClient.makeBucket(bucket, 'us-east-1'); // Replace 'us-east-1' with your region if different
        }

        await minioClient.fPutObject(bucket, destinationObject, sourceFile, metaData);
        console.log(`File '${sourceFile}' uploaded as '${destinationObject}' in bucket '${bucket}'`);
    } catch (err) {
        console.error('Error uploading file:', err);
    }
};

// Get Content-Type based on file extension
const getContentType = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
        return 'image/jpeg';
    } else if (ext === '.png') {
        return 'image/png';
    }
    return 'application/octet-stream'; // Default content type if it's neither
};

// Main function to upload all images
const uploadImages = async () => {
    const imageFiles = getImagesFromDirectory('./pictures'); // Directory to search images in
    const highestIndex = await getHighestImageIndex(); // Get the current highest index in the bucket
    let newIndex = highestIndex + 1; // The next available index

    for (const file of imageFiles) {
        await uploadImage(file, newIndex); // Upload each file with the new index
        newIndex++; // Increment the index for the next image
    }
};

// Start uploading process
uploadImages().then(() => {
    console.log('All images uploaded.');
}).catch((err) => {
    console.error('Error uploading images:', err);
});
