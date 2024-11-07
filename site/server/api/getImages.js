import * as Minio from 'minio'
const config = useRuntimeConfig();

const minioClient = new Minio.Client({
  endPoint: config.s3endpoint,
  useSSL: true,
  accessKey: config.s3accessKey,
  secretKey: config.s3secretKey
});

export default defineEventHandler(async (event) => {
    const urlPromises = [];
    try {
        const stream = minioClient.listObjects('aev-pictures', '', true);

        for await (const obj of stream) {
            const url = minioClient.presignedGetObject('aev-pictures', obj.name, 24 * 60 * 60);
            urlPromises.push(url);
        }

        const urls = await Promise.all(urlPromises);

        return { images: urls };
    } catch (err) {
        console.error("Error fetching images: ", err);
        throw createError({ statusCode: 500, message: "Error fetching images" });
    }
});
