import * as Minio from 'minio'
import 'dotenv/config'

const minioClient = new Minio.Client({
  endPoint: process.env.ENDPOINT,
  useSSL: true,
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY
});

async function getImages() {
    const urlPromises = [];
    try {
        const stream = minioClient.listObjects('aev-pictures', '', true);

        for await (const obj of stream) {
            const url = minioClient.presignedGetObject('aev-pictures', obj.name, 24 * 60 * 60);
            urlPromises.push(url);
        }

        const urls = await Promise.all(urlPromises);
        console.log(urls);
        return { images: urls };
    } catch (err) {
        console.error("Error fetching images: ", err);
        throw createError({ statusCode: 500, message: "Error fetching images" });
    }
}

getImages().then(() => {
    console.log('All images Listed.');
}).catch((err) => {
    console.error('Error getting images:', err);
});