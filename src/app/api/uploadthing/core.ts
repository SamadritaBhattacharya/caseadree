import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { z } from 'zod';
import sharp from 'sharp';
import { db } from '@/db';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input };
    })
    // server-side function
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      console.log("Upload complete for user:", metadata.input);
      console.log("File URL:", file.url);

      try {
        const res = await fetch(file.url);
        if (!res.ok) {
          throw new Error(`Failed to fetch the image. Status: ${res.status}`);
        }

        const buffer = await res.arrayBuffer();
        const imgBuffer = Buffer.from(buffer);

        const imgMetadata = await sharp(imgBuffer).metadata();
        const { width, height } = imgMetadata;

        if (!configId) {
          const configuration = await db.configuration.create({
            data: {
              imageUrl: file.url,
              height: height || 500,
              width: width || 500,
            },
          });

          return { configId: configuration.id };
        } else {
          // for step 2
          const updatedConfiguration = await db.configuration.update({
            where: {
              id: configId,
            },
            data: {
              croppedImageUrl: file.url,
            },
          });

          return { configId: updatedConfiguration.id };
        }
      } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process the image');
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
