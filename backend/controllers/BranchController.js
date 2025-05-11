// backend\controllers\BranchController.js
const express = require('express');
const { admin, auth, db } = require('../config/firebase');
const BranchModel = require('../models/Branch');

const BranchController = {
    // Add Branch
    addBranch: async (req, res) => {
        try {
            // Validate request
            const { name, location } = req.body;

            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Branch name is required'
                });
            }

            if (!location || !location.street || !location.barangay ||
                !location.municipality || !location.province) {
                return res.status(400).json({
                    success: false,
                    message: 'Complete location details are required'
                });
            }

            // Check if user is owner
            if (req.user.role !== 'owner') {
                return res.status(403).json({
                    success: false,
                    message: 'Only owners can create branches'
                });
            }

            const branchData = {
                name,
                location: {
                    street: location?.street || '',
                    barangay: location?.barangay || '',
                    municipality: location?.municipality || '',
                    province: location?.province || '',
                },
                isActive: false,
            };

            const branchId = await BranchModel.createBranch(branchData);

            // // Log the action
            // const logData = {
            //     action: 'CREATE_BRANCH',
            //     performedBy: userData,
            //     details: {
            //         branchId,
            //         branchName: name
            //     },
            //     timestamp: new Date()
            // };

            // const logRef = await db.collection('logs').add(logData);

            return res.status(201).json({
                // success: true,
                // message: 'Branch created successfully',
                // branchId,
                // logId: logRef.id
            });
        } catch (error) {
            console.error("Error creating branch:", error);
            return res.status(500).json({
                success: false,
                message: 'Server error: Unable to create branch',
                error: error.message
            });
        }
    },

    // Edit Branch
    editBranch: async (req, res) => {
        try {
            const branchId = req.params.id;
            const { name, location } = req.body;

            // Validate request
            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Branch name is required'
                });
            }

            if (!location || !location.street || !location.barangay ||
                !location.municipality || !location.province) {
                return res.status(400).json({
                    success: false,
                    message: 'Complete location details are required'
                });
            }

            // Check if user is owner
            if (req.user.role !== 'owner') {
                return res.status(403).json({
                    success: false,
                    message: 'Only owners can update branches'
                });
            }

            // const userData = {
            //     uid: updatedBy.uid,
            //     firstName: updatedBy.firstName,
            //     lastName: updatedBy.lastName,
            //     role: req.user.role
            // };

            const branchData = {
                name,
                location,
                // isActive,
                // updatedAt: new Date(),
                // updatedBy: {
                //     uid: userData.uid,
                //     firstName: userData.firstName,
                //     lastName: userData.lastName,
                //     role: userData.role
                // }
            };

            await BranchModel.updateBranch(branchId, branchData);

            // // Log the action
            // const logData = {
            //     action: 'UPDATE_BRANCH',
            //     performedBy: userData,
            //     details: {
            //         branchId,
            //         branchName: name
            //     },
            //     timestamp: new Date()
            // };

            // const logRef = await db.collection('logs').add(logData);

            return res.status(200).json({
                // success: true,
                // message: 'Branch updated successfully',
                // branchId,
                // logId: logRef.id
            });
        } catch (error) {
            console.error("Error updating branch:", error);
            return res.status(500).json({
                success: false,
                message: 'Server error: Unable to update branch',
                error: error.message
            });
        }
    },

    // Toggle Branch Status
    toggleBranchStatus: async (req, res) => {
        try {
            const branchId = req.params.id;
            const { isActive } = req.body;

            // Check if user is owner
            if (req.user.role !== 'owner') {
                return res.status(403).json({
                    success: false,
                    message: 'Only owners can update branch status'
                });
            }

            // Get branch data to include in log
            const branchRef = db.collection('branches').doc(branchId);
            const branchDoc = await branchRef.get();

            if (!branchDoc.exists) {
                return res.status(404).json({
                    success: false,
                    message: 'Branch not found'
                });
            }

            console.log(isActive);

            // const branchName = branchDoc.data().name;
            const branch = branchDoc.data();

            // Update branch status
            await BranchModel.toggleBranchStatus(
                branchRef,
                isActive
            );

            // await branchRef.update({
            //     isActive,
            //     updatedAt: Timestamp.now()
            // });

            // // Log the action
            // const logData = {
            //     action: isActive ? 'ACTIVATE_BRANCH' : 'DEACTIVATE_BRANCH',
            //     performedBy: userData,
            //     details: {
            //         branchId,
            //         branchName
            //     },
            //     timestamp: new Date()
            // };

            // const logRef = await db.collection('logs').add(logData);

            return res.status(200).json({
                // success: true,
                // message: `Branch ${isActive ? 'activated' : 'deactivated'} successfully`,
                // branchId,
                // logId: logRef.id
            });
        } catch (error) {
            console.error("Error toggling branch status:", error);
            return res.status(500).json({
                success: false,
                message: 'Server error: Unable to update branch status',
                error: error.message
            });
        }
    },

    // Delete Branch
    deleteBranch: async (req, res) => {
        try {
            const branchId = req.params.id;

            // Check if user is owner
            if (req.user.role !== 'owner') {
                return res.status(403).json({
                    success: false,
                    message: 'Only owners can delete branches'
                });
            }

            // Get branch data to include in log
            const branchRef = db.collection('branches').doc(branchId);
            const branchDoc = await branchRef.get();

            if (!branchDoc.exists) {
                return res.status(404).json({
                    success: false,
                    message: 'Branch not found'
                });
            }

            const branchName = branchDoc.data().name;

            // Delete or deactivate branch
            const result = await BranchModel.deleteBranch(branchId);

            // Log the action
            // const logData = {
            //     action: result.deleted ? 'DELETE_BRANCH' : 'DEACTIVATE_BRANCH',
            //     performedBy: {
            //         uid: req.user.uid,
            //         firstName: req.user.firstName,
            //         lastName: req.user.lastName,
            //         role: req.user.role
            //     },
            //     details: {
            //         branchId,
            //         branchName,
            //         result: result.message
            //     },
            //     timestamp: new Date()
            // };

            // const logRef = await db.collection('logs').add(logData);

            return res.status(200).json({
                success: true,
                message: result.message,
                deactivated: result.deactivated,
                deleted: result.deleted,
                // logId: logRef.id
            });
        } catch (error) {
            console.error("Error deleting branch:", error);
            return res.status(500).json({
                success: false,
                message: 'Server error: Unable to delete branch',
                error: error.message
            });
        }
    }
};

module.exports = BranchController;