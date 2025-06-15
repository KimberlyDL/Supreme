const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");

// Get all about tabs
router.get("/", async (req, res) => {
  try {
    const aboutCollection = await db.collection("about").orderBy("order").get();
    const tabs = [];

    aboutCollection.forEach((doc) => {
      tabs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json(tabs);
  } catch (error) {
    console.error("Error fetching about tabs:", error);
    res.status(500).json({ error: "Failed to fetch about information" });
  }
});

// Create new tab
router.post("/tabs", async (req, res) => {
  try {
    const { title, content, images, videos } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Get current max order
    const existingTabs = await db.collection("about").get();
    const maxOrder = existingTabs.size;

    const tabData = {
      title,
      content,
      images: images || [],
      videos: videos || [],
      order: maxOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("about").add(tabData);
    const newTab = {
      id: docRef.id,
      ...tabData,
    };

    res.status(201).json(newTab);
  } catch (error) {
    console.error("Error creating tab:", error);
    res.status(500).json({ error: "Failed to create tab" });
  }
});

// Update tab
router.put("/tabs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, images, videos } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const updateData = {
      title,
      content,
      images: images || [],
      videos: videos || [],
      updatedAt: new Date(),
    };

    await db.collection("about").doc(id).update(updateData);

    const updatedDoc = await db.collection("about").doc(id).get();
    const updatedTab = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };

    res.json(updatedTab);
  } catch (error) {
    console.error("Error updating tab:", error);
    res.status(500).json({ error: "Failed to update tab" });
  }
});

// Delete tab
router.delete("/tabs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the tab to be deleted to know its order
    const tabDoc = await db.collection("about").doc(id).get();
    if (!tabDoc.exists) {
      return res.status(404).json({ error: "Tab not found" });
    }

    const deletedOrder = tabDoc.data().order;

    // Delete the tab
    await db.collection("about").doc(id).delete();

    // Update order of remaining tabs
    const remainingTabs = await db
      .collection("about")
      .where("order", ">", deletedOrder)
      .get();
    const batch = db.batch();

    remainingTabs.forEach((doc) => {
      const newOrder = doc.data().order - 1;
      batch.update(doc.ref, { order: newOrder });
    });

    await batch.commit();

    res.json({ message: "Tab deleted successfully" });
  } catch (error) {
    console.error("Error deleting tab:", error);
    res.status(500).json({ error: "Failed to delete tab" });
  }
});

// Reorder tabs
router.put("/reorder", async (req, res) => {
  try {
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Order must be an array" });
    }

    const batch = db.batch();

    order.forEach((tab, index) => {
      const docRef = db.collection("about").doc(tab.id);
      batch.update(docRef, { order: index });
    });

    await batch.commit();

    res.json({ message: "Tabs reordered successfully" });
  } catch (error) {
    console.error("Error reordering tabs:", error);
    res.status(500).json({ error: "Failed to reorder tabs" });
  }
});

module.exports = router;
