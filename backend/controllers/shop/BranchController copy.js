// backend\controllers\shop\BranchController.js
const express = require('express');
const { admin, auth, db } = require('../../config/firebase');
const ActivityLog = require('../../services/ActivityLog');
const activityLog = new ActivityLog();

const BranchModel = require('../../models/BranchModel');

const BranchController = {

    addBranch: async (req, res) => {
        try {
            // Log request body and user details to ensure they are as expected
            console.log("Request body:", req.body);
            console.log("User details from middleware (req.user):", req.user);

            const { name, location, isActive, createdBy } = req.body;

            // Check if role and fullname are correctly set
            const role = req.user ? req.user.role : 'unknown';
            const fullname = req.user ? `${req.user.firstName} ${req.user.lastName}` : 'unknown';

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

            console.log("Branch data to be saved:", branchData);

            const branchRef = await db.collection('branches').add(branchData);
            const branchId = branchRef.id;

            //make notif and log

            console.log("Branch added to Firestore with ID:", branchId);

            if (!createdBy || !createdBy.uid || !fullname) {
                console.error('CreatedBy or fullname is missing');
                return res.status(400).json({ message: 'Invalid createdBy information' });
            }

            await activityLog.logAddBranchAction(
                createdBy.uid,
                fullname,
                role,
                branchId,
                branchData.name,
                branchData.location,
                req
            );
            console.log("Activity log created successfully");

            return res.status(201).json({
                message: 'Branch created successfully',
                branchId: branchRef.id
            });

        } catch (error) {
            console.error("Detailed error creating branch:", error.stack || error.message || error);
            return res.status(500).json({
                message: 'Server error: Unable to create branch',
                error: error.stack || error.message || error
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

            const branchRef = db.collection('branches').doc(branchId);
            const branchDoc = await branchRef.get();

            if (!branchDoc.exists) {
                return res.status(404).json({ message: 'Branch not found' });
            }

            const updateData = {
                name,
                location,
                isActive,
                updatedAt: new Date()
            };

            await branchRef.update(updateData);

            // Log the edit activity
            const role = req.user ? req.user.role : 'unknown';
            const fullname = updatedBy ? `${updatedBy.firstName} ${updatedBy.lastName}` : 'unknown';

            await activityLog.logEditBranchAction(
                updatedBy.uid,
                fullname,
                role,
                branchId,
                name,
                location,
                req
            );

            return res.status(200).json({
                message: 'Branch updated successfully',
                branchId
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

            const branchRef = db.collection('branches').doc(branchId);
            const branchDoc = await branchRef.get();

            if (!branchDoc.exists) {
                return res.status(404).json({ message: 'Branch not found' });
            }

            await branchRef.update({
                isActive,
                updatedAt: new Date()
            });

            // Log the status change activity
            const role = req.user ? req.user.role : 'unknown';
            const fullname = updatedBy ? `${updatedBy.firstName} ${updatedBy.lastName}` : 'unknown';
            const action = isActive ? 'ACTIVATE' : 'DEACTIVATE';

            await activityLog.logBranchStatusChangeAction(
                updatedBy.uid,
                fullname,
                role,
                branchId,
                branchDoc.data().name,
                action,
                req
            );

            return res.status(200).json({
                message: `Branch ${isActive ? 'activated' : 'deactivated'} successfully`,
                branchId
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
