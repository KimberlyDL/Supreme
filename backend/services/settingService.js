// backend\services\settingService.js
const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs").promises;

class SettingsService {
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Remove sensitive data
    const { password, ...userProfile } = user;
    return userProfile;
  }

  async updateProfile(userId, profileData, avatarUrl = null) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData = {
      profile: {
        ...user.profile,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        number: profileData.number,
        address: {
          ...user.profile?.address,
          ...profileData.address,
        },
      },
      updatedAt: new Date(),
    };

    if (avatarUrl) {
      updateData.profile.avatarUrl = avatarUrl;
    }

    const updatedUser = await userRepository.update(userId, updateData);
    const { password, ...userProfile } = updatedUser;
    return userProfile;
  }

  async uploadAvatar(avatarFile) {
    try {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(avatarFile.mimetype)) {
        throw new Error(
          "Invalid file type. Only JPG, PNG, and GIF are allowed."
        );
      }

      // Validate file size (2MB max)
      if (avatarFile.size > 2 * 1024 * 1024) {
        throw new Error("File size too large. Maximum size is 2MB.");
      }

      // Generate unique filename
      const fileExtension = path.extname(avatarFile.name);
      const fileName = `avatar-${uuidv4()}${fileExtension}`;
      const uploadPath = path.join(__dirname, "../uploads/avatars", fileName);

      // Ensure upload directory exists
      await fs.mkdir(path.dirname(uploadPath), { recursive: true });

      // Process and save image
      await sharp(avatarFile.data)
        .resize(200, 200, { fit: "cover" })
        .jpeg({ quality: 90 })
        .toFile(uploadPath);

      // Return the URL path
      return `/uploads/avatars/${fileName}`;
    } catch (error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  }

  async updateNotifications(userId, notifications) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData = {
      notifications: {
        ...user.notifications,
        ...notifications,
      },
      updatedAt: new Date(),
    };

    await userRepository.update(userId, updateData);
    return updateData.notifications;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters long");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await userRepository.update(userId, {
      password: hashedNewPassword,
      updatedAt: new Date(),
    });
  }

  async deactivateAccount(userId, password) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Password is incorrect");
    }

    // Deactivate account
    await userRepository.update(userId, {
      isActive: false,
      updatedAt: new Date(),
    });
  }
}

module.exports = new SettingsService();
