// backend\controllers\shop\BranchController.js
const express = require('express');
const { admin, auth, db } = require('../../config/firebase');
const BranchService = require('../../services/BranchService');
const branchService = new BranchService();

const BranchModel = require('../../models/BranchModel');

const BranchController = {

    addBranch: async (req, res) => {
        try {

            console.log("Request body:", req.body);
            console.log("User details from middleware (req.user):", req.user);

            // return res.status(500).json({
            //     message: 'Stop',
            // });

            const { name, location, isActive, createdBy } = req.body;

            const userData = {
                uid: createdBy.uid,
                firstName: createdBy.firstName,
                lastName: createdBy.lastName,
                role: req.user.role
            };

            // console.log("userdata body:", userData);

            // return res.status(500).json({
            //     message: 'Stop',
            // });

            const branchData = {
                name,
                location: {
                    street: location?.street || '',
                    barangay: location?.barangay || '',
                    municipality: location?.municipality || '',
                    province: location?.province || '',
                },
                isActive: isActive || false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const { logId, notificationId } = await branchService.addBranch(branchData, userData, req);

            return res.status(201).json({
                message: 'Branch created successfully',
                branchId: branchData.id,
                logId,
                notificationId
            });
        } catch (error) {
            console.error("Error creating branch:", error);
            return res.status(500).json({
                message: 'Server error: Unable to create branch',
                error: error.message
            });
        }

    },

    getBranch: async (req, res) => {
        try {
            const branchId = req.params.id;

            const branch = await BranchModel.getBranchById(branchId);

            if (!branch) {
                return res.status(404).json({
                    message: 'Branch not found'
                });
            }

            return res.status(200).json(branch);
        } catch (error) {
            console.error("Error retrieving branch:", error);
            return res.status(500).json({
                message: 'Server error: Unable to retrieve branch',
                error
            });
        }
    },

    getAllBranches: async (req, res) => {
        try {
            const branches = await BranchModel.getAllBranches();

            return res.status(200).json(branches);
        } catch (error) {
            console.error("Error retrieving branches:", error);
            return res.status(500).json({
                message: 'Server error: Unable to retrieve branches',
                error
            });
        }
    },

    deleteBranch: async (req, res) => {
        try {
            const branchId = req.params.id;

            const result = await BranchModel.deleteBranch(branchId);

            return res.status(200).json({
                message: result.message
            });
        } catch (error) {
            console.error("Error deleting branch:", error);
            return res.status(500).json({
                message: 'Server error: Unable to delete branch',
                error
            });
        }
    },

    editBranch: async (req, res) => {
        try {
            const branchId = req.params.id;
            const { name, location, isActive, updatedBy } = req.body;
            const userData = {
                uid: updatedBy.uid,
                firstName: updatedBy.firstName,
                lastName: updatedBy.lastName,
                role: req.user.role
            };

            const branchData = {
                name,
                location,
                isActive,
                updatedAt: new Date()
            };

            const { logId, notificationId } = await branchService.editBranch(branchId, branchData, userData, req);

            return res.status(200).json({
                message: 'Branch updated successfully',
                branchId,
                logId,
                notificationId
            });
        } catch (error) {
            console.error("Error updating branch:", error);
            return res.status(500).json({
                message: 'Server error: Unable to update branch',
                error: error.message
            });
        }
    },

    toggleBranchStatus: async (req, res) => {
        try {
            const branchId = req.params.id;
            const { isActive, updatedBy } = req.body;
            const userData = {
                uid: updatedBy.uid,
                firstName: updatedBy.firstName,
                lastName: updatedBy.lastName,
                role: req.user.role
            };

            const { logId, notificationId } = await branchService.toggleBranchStatus(branchId, isActive, userData, req);

            return res.status(200).json({
                message: `Branch ${isActive ? 'activated' : 'deactivated'} successfully`,
                branchId,
                logId,
                notificationId
            });
        } catch (error) {
            console.error("Error toggling branch status:", error);
            return res.status(500).json({
                message: 'Server error: Unable to update branch status',
                error: error.message
            });
        }
    }
};

module.exports = BranchController;
