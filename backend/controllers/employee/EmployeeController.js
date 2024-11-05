// backend\controllers\employee\EmployeeController.js
const { db, bucket } = require('../../config/firebase');
const { v4: uuidv4 } = require('uuid');
const EmployeeModel = require('../../models/EmployeeModel');
const UploadModel = require('../../models/UploadModel');
const { getAuth } = require('firebase-admin/auth');
const EmployeeService = require('../../services/EmployeeService');

const employeeService = new EmployeeService();

const EmployeeController = {
  // Handle image upload using express-fileupload
  uploadImage: async (req, res) => {
    try {

      if (!req.files || !req.files.file) {
        return res.status(400).json('No files were uploaded.');
      }

      const file = req.files.file;

      console.log('Received file:', file);

      // Sanitize the file name
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${uuidv4()}_${sanitizedFileName}`;
      const fileUpload = bucket.file(`uploads/${fileName}`);

      // Create a write stream to Firebase Storage
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype, // Use the file's mimetype
        },
      });

      // Handle errors during the upload
      stream.on('error', (err) => {
        console.error('Error during upload:', err);
        return res.status(500).json({ error: 'Failed to upload image' });
      });

      // Handle the finish event
      stream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`;

          // Prepare file metadata to be saved to Firestore
          const fileData = {
            fileName: fileName,
            fileUrl: publicUrl,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadTime: new Date(),
            category: "profile_picture",   // or other category depending on your context
            isActive: true,                // You can toggle this to false later if needed
            metadata: {
              width: 400,                  // You can calculate actual dimensions or set it
              height: 400,
              tags: ['profile', 'avatar']   // Add tags for categorization if necessary
            }
          };

          // Save file metadata using UploadModel
          const savedFileData = await UploadModel.saveFileData(fileData);

          // Return file URL and metadata to the frontend
          return res.status(200).json({ message: 'Saving Image successful', fileUrl: publicUrl, fileData: savedFileData });

        } catch (error) {
          console.error('Error saving file data to Firestore:', error);
          return res.status(500).json({ error: 'Failed to save file data' });
        }
      });

      // Stream the file buffer to Firebase Storage
      stream.end(file.data);
      // `file.data` is the file buffer coming from express-fileupload

    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  },

  // Create employee and register in Firebase Auth
  createEmployee: async (req, res) => {
    let FileName = null;
    let ImageUrl = null;

    try {
      const { 
        firstName, lastName, email, password, phone, 
        street, barangay, municipality, province, 
        role, salary, branchName, profileImageUrl, fileName
      } = req.body;


      ImageUrl = profileImageUrl || null;
      FileName = fileName || null;

      const auth = getAuth(); // Get Firebase Auth instance

      // Step 1: Register employee in Firebase Auth
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });

      // Step 2: Prepare the employee data for Firestore
      const employeeData = {
        uid: userRecord.uid,
        firstName,
        lastName,
        email,
        phone,
        address: {
          street,
          barangay,
          municipality,
          province,
        },
        isActive: true,
        role,
        salary,
        branchName,
        profileImageUrl: profileImageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Step 3: Save employee data in Firestore using your EmployeeModel
      const empData = await EmployeeModel.createEmployee(employeeData);

      const { logId, notificationId } = await employeeService.handleNewEmployee(employeeData, req);

      //return res.status(200).json({ message: 'Employee created successfully', employeeData: empData });

      return res.status(200).json({
        message: 'Employee created successfully',
        employeeData: empData,
        logId,
        notificationId
      });

    } catch (error) {
      console.error('Error creating employee:', error);

      if (ImageUrl) {
        try {
          const fileUpload = bucket.file(`uploads/${FileName}`);
          await fileUpload.delete();
          console.log('Uploaded image deleted due to employee creation failure');
        } catch (deleteError) {
          console.error('Error deleting uploaded image:', deleteError);
        }
      }

      try {
        // Delete the uploaded file document from Firestore
        const uploadDocRef = db.collection('uploads').where('fileName', '==', FileName);
        const snapshot = await uploadDocRef.get();

        snapshot.forEach(async (doc) => {
          await doc.ref.delete();
          console.log('Uploaded file document deleted from Firestore due to employee creation failure');
        });
      } catch (firestoreDeleteError) {
        console.error('Error deleting uploaded file document from Firestore:', firestoreDeleteError);
      }

      return res.status(500).json({ error: 'Failed to create employee' });
    }
  }
};

module.exports = EmployeeController;
