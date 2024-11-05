// backend/controllers/admin/AdminProfileController.js
const { bucket } = require('../../config/firebase')
const { v4: uuidv4 } = require('uuid')
const AdminModel = require('../../models/AdminModel')

const AdminProfileController = {
  async uploadProfileImage(req, res) {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const file = req.files.file
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = `${uuidv4()}_${sanitizedFileName}`
      const fileUpload = bucket.file(`uploads/${fileName}`)

      const stream = fileUpload.createWriteStream({ metadata: { contentType: file.mimetype } })
      stream.on('error', (err) => res.status(500).json({ error: 'Failed to upload image' }))
      stream.on('finish', async () => {
        await fileUpload.makePublic()
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`
        res.status(200).json({ message: 'Profile image uploaded successfully', fileUrl: publicUrl })
      })
      stream.end(file.data)
    } catch (error) {
      res.status(500).json({ error: 'Error uploading profile image' })
    }
  },

  async updateAddressInfo(req, res) {
    const { street, barangay, municipality, province } = req.body
    try {
      const updatedAddress = await AdminModel.updateAddress(req.userId, {
        street,
        barangay,
        municipality,
        province
      })
      res.status(200).json({ message: 'Address information updated successfully', updatedAddress })
    } catch (error) {
      res.status(500).json({ error: 'Error updating address information' })
    }
  },

  async updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body
    try {
      const isPasswordValid = await AdminModel.validatePassword(req.userId, currentPassword)
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' })
      }
      await AdminModel.updatePassword(req.userId, newPassword)
      res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Error updating password' })
    }
  }
}

module.exports = AdminProfileController
