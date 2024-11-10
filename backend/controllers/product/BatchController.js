// backend/controllers/BatchController.js
const BatchService = require('../../services/BatchService');

const BatchController = {
  getBatches: async (req, res) => {
    try {
      const { branchId } = req.query;
      const batches = await BatchService.getBatches(branchId);
      res.json(batches);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch batches' });
    }
  },

  addBatch: async (req, res) => {
    try {
      const batchData = req.body;
      const newBatch = await BatchService.addBatch(batchData, req.user);
      res.status(201).json(newBatch);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add batch' });
    }
  },

  updateBatch: async (req, res) => {
    try {
      const { id } = req.params;
      const batchData = req.body;
      const updatedBatch = await BatchService.updateBatch(id, batchData, req.user);
      res.json(updatedBatch);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update batch' });
    }
  },

  deleteBatch: async (req, res) => {
    try {
      const { id } = req.params;
      await BatchService.deleteBatch(id, req.user);
      res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete batch' });
    }
  },
};

module.exports = BatchController;