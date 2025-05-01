/* "Infer parameter types from usage" is the better option to choose.

Here's why:
1- "Infer parameter types from usage" will look only at the specific function where error and result are used and try to infer their types based on how they're used in that context.

2- "Infer all types from usage" applies inference across your entire file or project, which can be overkill if you only want to fix these specific parameters. */

require("dotenv").config();
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  fileBuffer: ArrayBuffer,
  folder: string = "classifieds"
) {
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 1000, crop: "limit" }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Failed to upload image"));
          }
          resolve(result.secure_url);
        }
      )
      .end(Buffer.from(fileBuffer));
  });
}
