const { Timestamp } = require('../../config/firebase');
const CategoryModel = require('../../models/CategoryModel');

const CategoryController = {
    getCategories: async (req, res) => {
        try {
            const categories = await CategoryModel.getAllCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    },

    getActiveCategories: async (req, res) => {
        try {
          const branchnames = await ProductModel.getActiveCategories();
          console.log(branchnames);
          return res.status(200).json(branchnames);
        } catch (error) {
          console.error("Error retrieving branches:", error);
          return res.status(500).json({
            message: 'Unable to retrieve branches',
          });
        }
      },

    addCategory: async (req, res) => {
        try {
            const categoryData = req.body;
            console.log(categoryData);

            if (!categoryData.name) {
                return res.status(400).json({ error: 'Missing name' });
            }

            // const categoryData = {
            //     name: '',
            //     createdAt: Timestamp.now(),
            //     updatedAt: Timestamp.now(),
            //     isActive: true
            // };

            const data = {
                ...req.body,
                isActive: true
            };


            const newCategory = await CategoryModel.addCategory(data);

            res.status(201).json({
                message: 'Category created successfully',
                categoryData: newCategory,
            });

        } catch (error) {
            console.error('Failed to add category:', error);
            res.status(500).json({ error: 'Failed to add category' });
        }
    },


    

    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const categoryData = {
                ...req.body,
                updatedAt: Timestamp.now()
            };

            const updatedCategory = await CategoryModel.updateCategory(id, categoryData);

            res.json({
                message: 'Category updated successfully',
                categoryData: updatedCategory
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update category' });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            await CategoryModel.deleteCategory(id);

            res.json({
                message: 'Category deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete category' });
        }
    }
};

module.exports = CategoryController;