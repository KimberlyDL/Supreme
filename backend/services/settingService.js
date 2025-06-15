// backend\services\settingService.js
const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs").promises;
const ImageService = require("./ImageService");

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

  async updateProfile(userId, profileData, imageFile) {
    try {
      console.log(profileData);

      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
        // console.log("user not found");
      }

      let imagePath = null;
      if (imageFile) {
        const imageService = new ImageService();
        imagePath = await imageService.upload(imageFile);
      }

      const updateData = {
        profile: {
          ...user.profile,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          number: profileData.number || null,
          address: {
            ...user.profile?.address,
            ...profileData.address,
          },
          avatarUrl: imagePath,
        },
      };

      const updatedUser = await userRepository.update(userId, updateData);
      const { password, ...userProfile } = updatedUser;
      return userProfile;
    } catch (error) {
      console.log(error);
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
