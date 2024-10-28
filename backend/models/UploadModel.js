const { db } = require('../config/firebase');

const UploadModel = {
    async saveFileData(fileData) {
        try {
          // Save the file data to the 'uploads' collection in Firestore
          const fileRef = db.collection('uploads').doc(); // Create a new document with an auto-generated ID
          await fileRef.set(fileData); // Save the file metadata
          const fileDataWithId = {
            ...fileData,    // Spread the original file data
            id: fileRef.id  // Add the Firestore document ID
          };
      
          return fileDataWithId;
        } catch (error) {
          throw new Error('Error saving file metadata to Firestore: ' + error.message);
        }
      },
    
      // Optional method to retrieve file data based on file name or other criteria
      async getFileByName(fileName) {
        try {
          const fileSnapshot = await db.collection('uploads').where('fileName', '==', fileName).get();
          if (fileSnapshot.empty) {
            return null;
          }
    
          const fileDoc = fileSnapshot.docs[0];
          const fileData = fileDoc.data();
          fileData.id = fileDoc.id; // Include the document ID for reference
    
          return fileData;
        } catch (error) {
          throw new Error('Error retrieving file metadata from Firestore: ' + error.message);
        }
      }
    };
    
module.exports = UploadModel;