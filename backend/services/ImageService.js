// backend/services/ImageService.js
// This class handles image processing and storage

const { bucket } = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

class ImageService {
  constructor() {
    this.uploadPath = "uploads";
  }

  // Upload a single image
  async upload(imageFile) {
    if (!imageFile) {
      throw new Error("No image file provided");
    }

    try {
      // Process image with sharp
      const processedImageBuffer = await sharp(imageFile.data)
        .resize(1000, 1000, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Generate unique filename
      const sanitizedFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${uuidv4()}_${sanitizedFileName}`;
      const filePath = `${this.uploadPath}/${fileName}`;

      // Upload to storage
      const fileUpload = bucket.file(filePath);

      await new Promise((resolve, reject) => {
        const stream = fileUpload.createWriteStream({
          metadata: {
            contentType: "image/jpeg",
            metadata: {
              originalFileName: imageFile.name,
              originalMimeType: imageFile.mimetype,
            },
          },
          resumable: false,
        });

        stream.on("error", reject);

        stream.on("finish", () => resolve());

        stream.end(processedImageBuffer);
      });

      return filePath;
    } catch (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }

  // Upload multiple product images
  async uploadMultipleProductImages(imageFiles) {
    if (!imageFiles) {
      return [];
    }

    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

    const imageMap = new Map();

    await Promise.all(
      files.map(async (file) => {
        const imageUrl = await this.upload(file);
        imageMap.set(file.name, imageUrl);
      })
    );

    return imageMap;
  }

  // // Upload multiple images
  // Upload multiple images
  async uploadMultiple(imageFiles) {
    if (!imageFiles) {
      return []
    }

    // Convert to array if single file
    const files = Array.isArray(imageFiles) ? imageFiles : [imageFiles]

    // Upload each file
    const uploadPromises = files.map((file) => this.upload(file))

    return await Promise.all(uploadPromises)
  }

  // Delete a single image
  async delete(imagePath) {
    if (!imagePath) {
      return false;
    }

    try {
      const file = bucket.file(imagePath);
      await file.delete();
      return true;
    } catch (error) {
      console.error(`Error deleting image ${imagePath}:`, error);
      return false;
    }
  }

  // Delete multiple images
  async deleteMultiple(imagePaths) {
    if (!imagePaths || imagePaths.length === 0) {
      return [];
    }

    // Delete each file
    const deletePromises = imagePaths.map((path) => this.delete(path));

    return await Promise.all(deletePromises);
  }

  // Get public URL for an image
  async getPublicUrl(imagePath) {
    if (!imagePath) {
      return null;
    }

    try {
      const file = bucket.file(imagePath);
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      return url;
    } catch (error) {
      console.error(`Error getting URL for image ${imagePath}:`, error);
      return null;
    }
  }

  // Get public URLs for multiple images
  async getPublicUrls(imagePaths) {
    if (!imagePaths || imagePaths.length === 0) {
      return [];
    }

    // Get URL for each file
    const urlPromises = imagePaths.map((path) => this.getPublicUrl(path));

    return await Promise.all(urlPromises);
  }
}

module.exports = ImageService;
