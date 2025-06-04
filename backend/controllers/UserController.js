// backend\controllers\UserController.js
const userService = require("../services/settingService");
const { validationResult } = require("express-validator");

const UserController = {
  getProfile: async (req, res) => {
    try {
      const userId = req.user.uid;
      const user = await userService.getUserProfile(userId);

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateProfile: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.uid;
      const profileData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        number: req.body.number,
        address: JSON.parse(req.body.address || "{}"),
      };

      let avatarUrl = null;
      if (req.files && req.files.avatar) {
        avatarUrl = await userService.uploadAvatar(req.files.avatar);
      }

      const updatedUser = await userService.updateProfile(
        userId,
        profileData,
        avatarUrl
      );

      res.json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  updateNotifications: async (req, res) => {
    try {
      const userId = req.user.uid;
      const notifications = req.body;

      const updatedNotifications = await userService.updateNotifications(
        userId,
        notifications
      );

      res.json({
        success: true,
        notifications: updatedNotifications,
        message: "Notification settings updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  changePassword: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user.uid;
      const { currentPassword, newPassword } = req.body;

      await userService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
  deactivateAccount: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { password } = req.body;

      await userService.deactivateAccount(userId, password);

      res.json({
        success: true,
        message: "Account deactivated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = UserController;
