// backend/services/firebaseIndexService.js
const admin = require('firebase-admin');

/**
 * Service to create and manage Firestore indexes
 */
class FirebaseIndexService {
  /**
   * Create necessary composite indexes for inventory management
   * @returns {Promise<void>}
   */
  async createInventoryIndexes() {
    try {
      const db = admin.firestore();
      
      // Create index for branch_stocks collection
      await this.createIndex('branch_stocks', [
        { fieldPath: 'branchId', order: 'ASCENDING' },
        { fieldPath: 'productId', order: 'ASCENDING' }
      ]);
      
      // Create index for inventory_logs collection
      await this.createIndex('inventory_logs', [
        { fieldPath: 'branchId', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]);
      
      // Create index for inventory_logs with type filter
      await this.createIndex('inventory_logs', [
        { fieldPath: 'branchId', order: 'ASCENDING' },
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' }
      ]);
      
      console.log('Inventory indexes created successfully');
    } catch (error) {
      console.error('Error creating inventory indexes:', error);
      throw error;
    }
  }
  
  /**
   * Create a composite index in Firestore
   * @param {string} collectionId - Collection ID
   * @param {Array<Object>} fields - Fields to index
   * @returns {Promise<void>}
   */
  async createIndex(collectionId, fields) {
    try {
      const db = admin.firestore();
      
      // Check if index already exists
      const indexes = await db.listIndexes();
      const indexExists = indexes.some(index => {
        if (index.queryScope === 'COLLECTION' && 
            index.collectionGroup === collectionId && 
            index.fields.length === fields.length) {
          // Check if fields match
          return index.fields.every((field, i) => 
            field.fieldPath === fields[i].fieldPath && 
            field.order === fields[i].order
          );
        }
        return false;
      });
      
      if (indexExists) {
        console.log(`Index for ${collectionId} already exists`);
        return;
      }
      
      // Create index
      await db.collection(collectionId).createIndex({
        fields: fields
      });
      
      console.log(`Index for ${collectionId} created successfully`);
    } catch (error) {
      console.error(`Error creating index for ${collectionId}:`, error);
      throw error;
    }
  }
}

module.exports = new FirebaseIndexService();