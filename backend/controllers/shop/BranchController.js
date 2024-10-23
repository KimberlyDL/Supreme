const express = require('express');
const router = express.Router();

const BranchModel = require('../../models/BranchModel');

const BranchController = {
    addBranch: async (req, res) => {
        try {
            const branchData = req.body.branchData;

            const newBranchId = await BranchModel.createBranch(branchData);

            return res.status(201).json({
                message: 'Branch created successfully',
                branchId: newBranchId
            });
        } catch (error) {
            console.error("Error creating branch:", error);
            return res.status(500).json({
                message: 'Server error: Unable to create branch',
                error
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

    editBranch: async (req, res) => {
        try {
            const branchId = req.params.id;
            const updatedData = req.body;

            const updatedBranch = await BranchModel.updateBranch(branchId, updatedData);

            if (!updatedBranch) {
                return res.status(404).json({
                    message: 'Branch not found or could not be updated'
                });
            }

            return res.status(200).json({
                message: 'Branch updated successfully',
                branch: updatedBranch
            });
        } catch (error) {
            console.error("Error updating branch:", error);
            return res.status(500).json({
                message: 'Server error: Unable to update branch',
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
    }
};

module.exports = BranchController;
