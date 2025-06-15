import { defineStore } from "pinia";
import axios from "axios";
import { useToastStore } from "@/stores/toastStore";
const toast = useToastStore();

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useContactStore = defineStore("contact", {
  state: () => ({
    contactInfo: {
      phone: "",
      email: "",
      address: "",
    },
    loading: false,
    error: null,
  }),

  actions: {
    async fetchContactInfo() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${apiUrl}contact`);
        this.contactInfo = response.data;
      } catch (error) {
        this.error = "Failed to fetch contact information";
        console.error("Error fetching contact info:", error);
      } finally {
        this.loading = false;
      }
    },

    async updateContactInfo(contactData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.put(`${apiUrl}contact`, contactData);
        this.contactInfo = response.data;
        return {
          success: true,
          message: "Contact information updated successfully",
        };
      } catch (error) {
        this.error = "Failed to update contact information";
        console.error("Error updating contact info:", error);
        return {
          success: false,
          message: "Failed to update contact information",
        };
      } finally {
        this.loading = false;
      }
    },

    async sendEmail(formData) {
      this.loading = true;
      this.error = null;
      try {
        formData.subject = `Contact Form: ${formData.subject}`;

        const response = await axios.post(
          `${apiUrl}contact/send-email`,
          formData
        );

        toast.addToast({
          type: "success",
          message: response.data?.message || "Message sent successfully",
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 400) {
          const error = new Error(
            displayToUser
              ? msg || "Some required fields are missing."
              : "Some required fields are missing."
          );
          error.formError = true;
          throw error;
        } else if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg ||
              "Message not sent due to an unexpected error. Please try again later."
            : "Message not sent due to an unexpected error. Please try again later.",
          duration: 3000,
        });
      }
    },
  },
});
