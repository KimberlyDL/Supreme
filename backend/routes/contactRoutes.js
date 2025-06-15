const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const ContactMailer = require("../utilities/mail/ContactMailer");

// Get contact information
router.get("/", async (req, res) => {
  try {
    const branchDoc = await db
      .collection("branches")
      .doc("2TmU8kbffinYZtJBDpdU")
      .get();

    if (!branchDoc.exists) {
      // Create default contact info if it doesn't exist
      const defaultContact = {
        phone: "",
        email: "",
        address: "",
        updatedAt: new Date(),
      };

      await db.collection("branches").doc("2TmU8kbffinYZtJBDpdU").set(
        {
          contact: defaultContact,
        },
        { merge: true }
      );

      return res.json(defaultContact);
    }

    const branchData = branchDoc.data();
    const contactInfo = branchData.contact || {
      phone: "",
      email: "",
      address: "",
    };

    res.json(contactInfo);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({ error: "Failed to fetch contact information" });
  }
});

// Update contact information
router.put("/", async (req, res) => {
  try {
    const { phone, email, address } = req.body;

    const contactData = {
      phone: phone || "",
      email: email || "",
      address: address || "",
      updatedAt: new Date(),
    };

    await db.collection("branches").doc("2TmU8kbffinYZtJBDpdU").set(
      {
        contact: contactData,
      },
      { merge: true }
    );

    res.json(contactData);
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ error: "Failed to update contact information" });
  }
});

// Send email from contact form
router.post("/send-email", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message || !subject) {
      return res.status(400).json({
        message: "All fields (name, email, subject, message) are required.",
        displayToUser: true,
      });
    }

    const mailer = new ContactMailer();

    // Send the message to your business email (self)
    await mailer.sendMessage(process.env.GMAIL_USER, {
      fullname: name,
      email,
      subject,
      message,
    });

    return res.status(201).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Error sending contact email:", error);

    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
      displayToUser: true,
    });
  }
});

module.exports = router;
