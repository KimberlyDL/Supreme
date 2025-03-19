// backend\lib\UploadImages.js

const { db, bucket, Timestamp } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const sharp = require("sharp");

class UploadImages {
    constructor(category = 'uploads', allowedTypes = ['image/jpeg', 'image/png'], maxFileSize = 5 * 1024 * 1024) {
        this.category = category;
        this.allowedTypes = allowedTypes;
        this.maxFileSize = maxFileSize;
    }

    static sanitizeFileName(fileName) {
        return fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    }

    async uploadImage(file) {
        if (!file) throw new Error('File is required.');
        if (!this.allowedTypes.includes(file.mimetype)) throw new Error('Invalid file type.');
        if (file.size > this.maxFileSize) throw new Error('File size exceeds limit.');

        const sanitizedFileName = UploadImages.sanitizeFileName(file.name);
        const fileName = `${uuidv4()}_${sanitizedFileName}`;
        const filePath = `${this.category}/${fileName}`;
        const fileRef = bucket.file(filePath);

        // Process image before upload
        const processedImageBuffer = await sharp(file.data)
            .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

        return new Promise((resolve, reject) => {
            const stream = fileRef.createWriteStream({
                metadata: { contentType: 'image/jpeg' },
                resumable: false,
            });

            stream.on('error', reject);
            stream.on('finish', async () => {
                try {
                    const fileData = {
                        fileName,
                        filePath,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadTime: Timestamp.now(),
                    };
                    resolve(fileData);
                } catch (error) {
                    reject(error);
                }
            });
            stream.end(processedImageBuffer);
        });
    }

    async uploadMultipleImages(files) {
        if (!Array.isArray(files)) files = [files];
        const uploadResults = await Promise.all(files.map(file => this.uploadImage(file)));
        return uploadResults;
    }

    async saveImageMetadata(fileData) {
        const docRef = db.collection('uploads').doc();
        await docRef.set(fileData);
        return { id: docRef.id, ...fileData };
    }

    async saveMultipleImageMetadata(filesData) {
        return Promise.all(filesData.map(fileData => this.saveImageMetadata(fileData)));
    }
    /**
     * Delete a single image from Firebase Storage
     * @param {string} filePath - Full path of the file in storage
     * @returns {Promise<{ success: boolean, filePath: string }>}
     */
    async deleteImage(filePath) {
        const fileRef = bucket.file(filePath)
        try {
            await fileRef.delete()
            console.log(`Successfully deleted image: ${filePath}`)
            return { success: true, filePath }
        } catch (error) {
            console.error(`Failed to delete image ${filePath}:`, error)
            return { success: false, filePath, error: error.message }
        }
    }

    /**
     * Delete multiple images from Firebase Storage
     * @param {string[]} filePaths - Array of file paths to delete
     * @returns {Promise<Array<{ success: boolean, filePath: string, error?: string }>>}
     */
    async deleteMultipleImages(filePaths) {
        if (!Array.isArray(filePaths) || filePaths.length === 0) {
            return []
        }

        const results = await Promise.all(filePaths.map((path) => this.deleteImage(path)))

        return results
    }

    /**
     * Delete image metadata from Firestore uploads collection
     * @param {string[]} imagePaths - Array of file paths to delete metadata for
     */
    static async deleteImagesFromUploads(imagePaths) {
        if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
            return
        }

        const batch = db.batch()

        for (const path of imagePaths) {
            try {
                const querySnapshot = await db.collection("uploads").where("filePath", "==", path).get()

                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref)
                })
            } catch (error) {
                console.error(`Error deleting image metadata for ${path}:`, error)
            }
        }

        await batch.commit()
    }

}

module.exports = UploadImages;


// #region OldCodes

// const { db, bucket, Timestamp } = require('../config/firebase');

// class FileUploader {
//     constructor(category = 'default', maxFileSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png']) {
//         this.category = category;
//         this.maxFileSize = maxFileSize; // Default: 5 MB
//         this.allowedTypes = allowedTypes; // Default: JPEG and PNG
//     }

//     static sanitizeFileName(fileName) {
//         return fileName.replace(/[^a-zA-Z0-9.]/g, '_');
//     }

//     static getCurrentDate() {
//         return new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
//     }

//     static getCurrentDateTime() {
//         // const now = new Date();
//         // const year = now.getFullYear();
//         // const month = String(now.getMonth() + 1).padStart(2, '0');
//         // const day = String(now.getDate()).padStart(2, '0');
//         // const hours = String(now.getHours()).padStart(2, '0');
//         // const minutes = String(now.getMinutes()).padStart(2, '0');
//         // const seconds = String(now.getSeconds()).padStart(2, '0');

//         // return `${year}${month}${day}${hours}${minutes}${seconds}`;

//         return new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
//     }

//     async renameFile(fileName, prefix = '') {
//         const sanitizedFileName = FileUploader.sanitizeFileName(fileName);
//         const uniqueFilename = `${prefix}${sanitizedFileName}`;
//         const fileUploadPath = bucket.file(`${this.category}/${uniqueFilename}`);

//         console.log("This is the uniqueFilename: ", fileUploadPath);
//         console.log("This is the fileUploadPath: ", fileUploadPath);
//         return { uniqueFilename, fileUploadPath };
//     }

//     validateFile(file) {
//         if (!file) {
//             throw new Error('File is missing or undefined.');
//         }

//         if (file.error) {
//             throw new Error(`File upload error: ${file.error}`);
//         }

//         if (file.size > this.maxFileSize) {
//             throw new Error(`File size exceeds the maximum limit of ${this.maxFileSize / 1024 / 1024} MB.`);
//         }

//         if (!this.allowedTypes.includes(file.mimetype)) {
//             throw new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedTypes.join(', ')}`);
//         }

//         if (!file.name) {
//             throw new Error('File name is missing.');
//         }

//         return true; // Validation passed
//     }

//     validateMultipleFiles(files) {
//         if (!files || files.length === 0) {
//             throw new Error('No files uploaded. Please upload at least one file.');
//         }

//         files.forEach((file) => {
//             this.validateFile(file); // Reuse the single file validation
//         });

//         return true; // All files passed validation
//     }

//     async uploadFile(file, prefix = '') {
//         this.validateFile(file);

//         const { uniqueFilename, fileUploadPath } = await this.renameFile(file.name, prefix);

//         return new Promise((resolve, reject) => {
//             const stream = fileUploadPath.createWriteStream({
//                 metadata: {
//                     contentType: file.mimetype,
//                 },
//             });

//             stream.on('error', (err) => {
//                 console.error('Error during upload:', err);
//                 reject(new Error('Failed to upload file'));
//             });

//             stream.on('finish', async () => {
//                 try {
//                     await fileUploadPath.makePublic();
//                     const publicUrl = `https://storage.googleapis.com/${bucket.name}/${this.category}/${uniqueFilename}`;
//                     resolve({
//                         fileName: uniqueFilename,
//                         fileUrl: publicUrl,
//                         fileType: file.mimetype,
//                         fileSize: file.size,
//                         uploadTime: Timestamp.now(),
//                         category: this.category,
//                         isActive: true,
//                         metadata: {}
//                     });
//                 } catch (error) {
//                     console.error('Error making file public:', error);
//                     reject(new Error('Failed to make file public'));
//                 }
//             });

//             stream.end(file.data);
//         });
//     }

//     async uploadMultipleFiles(files, prefix = '') {
//         this.validateMultipleFiles(files);

//         if (!Array.isArray(files)) {
//             files = [files]; // Wrap single file in an array for consistent processing
//         }

//         const uploadResults = [];
//         for (const file of files) {
//             const result = await this.uploadFile(file, prefix);
//             uploadResults.push(result);
//         }

//         return uploadResults;
//     }

//     async saveImageToDatabase(fileData) {
//         try {
//             const fileRef = db.collection('uploads').doc(); // Create a new document with an auto-generated ID
//             await fileRef.set(fileData); // Save the file metadata
//             return { ...fileData, id: fileRef.id }; // Return the file data with its Firestore document ID
//         } catch (error) {
//             throw new Error('Error saving file metadata to Firestore: ' + error.message);
//         }
//     }

//     async saveMultipleImagesToDatabase(fileDataArray) {
//         const savedResults = [];
//         try {
//             for (const fileData of fileDataArray) {
//                 const savedFile = await this.saveImageToDatabase(fileData);
//                 savedResults.push(savedFile);
//             }
//             return savedResults;
//         } catch (error) {
//             throw new Error('Error saving multiple file metadata to Firestore: ' + error.message);
//         }
//     }

//     async getFileByName(fileName) {
//         try {
//             const fileSnapshot = await db.collection('uploads').where('fileName', '==', fileName).get();
//             if (fileSnapshot.empty) {
//                 return null;
//             }

//             const fileDoc = fileSnapshot.docs[0];
//             return { ...fileDoc.data(), id: fileDoc.id }; // Include the document ID for reference
//         } catch (error) {
//             throw new Error('Error retrieving file metadata from Firestore: ' + error.message);
//         }
//     }
// }

// module.exports = FileUploader;






// const uploadMultipleImages = async (req, res) => {
//     try {
//         if (!req.files || !req.files.files || req.files.files.length === 0) {
//             return res.status(400).json({ error: 'No files uploaded.' });
//         }

//         const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
//         const fileUploader = new FileUploader('product-images');
//         const prefix = FileUploader.getCurrentDate() + '_';
//         const results = await fileUploader.uploadMultipleFiles(files, prefix);

//         return res.status(200).json({ message: 'Files uploaded successfully', data: results });
//     } catch (error) {
//         console.error('Error uploading files:', error);
//         return res.status(500).json({ error: 'Failed to upload files' });
//     }
// };



// const FileUploader = require('./lib/FileUploader');

// const uploadAndSaveMultipleImages = async (req, res) => {
//     try {
//         if (!req.files || !req.files.files || req.files.files.length === 0) {
//             return res.status(400).json({ error: 'No files uploaded.' });
//         }

//         const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
//         const fileUploader = new FileUploader('product-images');
//         const prefix = FileUploader.getCurrentDate() + '_';

//         // Upload files to Firebase Storage
//         const uploadResults = await fileUploader.uploadMultipleFiles(files, prefix);

//         // Save file metadata to Firestore
//         const savedResults = await fileUploader.saveMultipleImagesToDatabase(uploadResults);

//         return res.status(200).json({ message: 'Files uploaded and saved successfully', data: savedResults });
//     } catch (error) {
//         console.error('Error uploading and saving files:', error);
//         return res.status(500).json({ error: 'Failed to upload and save files' });
//     }
// };


// {
//   "file": {
//     "name": "example.jpg",
//     "data": "<Buffer ...>",  // Binary file data
//     "size": 102400,         // File size in bytes (e.g., 100 KB)
//     "encoding": "7bit",
//     "tempFilePath": "",
//     "truncated": false,
//     "mimetype": "image/jpeg", // File MIME type
//     "md5": "d41d8cd98f00b204e9800998ecf8427e" // MD5 checksum
//   }
// }


// {
//     "files": [
//         {
//             "name": "example1.jpg",
//             "data": "<Buffer ...>",
//             "size": 204800,
//             "encoding": "7bit",
//             "tempFilePath": "",
//             "truncated": false,
//             "mimetype": "image/jpeg",
//             "md5": "e99a18c428cb38d5f260853678922e03"
//         },
//         {
//             "name": "example2.png",
//             "data": "<Buffer ...>",
//             "size": 512000,
//             "encoding": "7bit",
//             "tempFilePath": "",
//             "truncated": false,
//             "mimetype": "image/png",
//             "md5": "5d41402abc4b2a76b9719d911017c592"
//         }
//     ]
// }




// const FileUploader = require('./lib/FileUploader');

// const singleFile = {
//     name: "example.jpg",
//     data: Buffer.from('...'), // File binary data
//     size: 102400,
//     mimetype: "image/jpeg"
// };

// const fileUploader = new FileUploader('product-images', 5 * 1024 * 1024); // Max size: 5 MB
// const prefix = FileUploader.getCurrentDateTime() + '_';

// try {
//     const result = await fileUploader.uploadFile(singleFile, prefix);
//     console.log('File uploaded successfully:', result);
// } catch (error) {
//     console.error('Error uploading file:', error.message);
// }






// const multipleFiles = [
//     {
//         name: "example1.jpg",
//         data: Buffer.from('...'),
//         size: 204800,
//         mimetype: "image/jpeg"
//     },
//     {
//         name: "example2.png",
//         data: Buffer.from('...'),
//         size: 512000,
//         mimetype: "image/png"
//     }
// ];

// const fileUploader = new FileUploader('product-images', 5 * 1024 * 1024); // Max size: 5 MB
// const prefix = FileUploader.getCurrentDateTime() + '_';

// try {
//     const results = await fileUploader.uploadMultipleFiles(multipleFiles, prefix);
//     console.log('Files uploaded successfully:', results);
// } catch (error) {
//     console.error('Error uploading files:', error.message);
// }

// #endregion
