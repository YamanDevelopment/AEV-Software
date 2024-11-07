# Bucket Manager

For the [gallery page](https://aev-demo.zachl.tech/gallery) of this project, I self hosted an instance of [min.io](https://github.com/minio/minio) in place of a S3 service to store and retrieve all the gallery photos. These were the bucket management files I made.

`uploadObjects.js`: Uploads all contents inside `[/pictures](./pictures/)` (PNG/JPGs) to my bucket with proper naming scheme and metadata
`listObjects.js`: Generates and lists temporary URLs for all objects in my bucket (I used this to test the concept of getting unique URLs for all images before moving it to the Nuxt server)
`REMOVED`: I had some other files such as a file downloader and other iterations of test files but they ended up getting deleted as most were for proof of concepts.