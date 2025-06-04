// frontend\src\stores\stockManagement.js

import axios from "axios";
import { getFreshToken } from "@/services/authService";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const _getAuthToken = async () => {
  const token = await getFreshToken(true);
  if (!token) throw new Error("Authentication token not available");
  return token;
};

const _convertDateToTimestamp = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
};

const _processExpirationDates = (expirationDates) => {
  if (!expirationDates || !Array.isArray(expirationDates)) return [];
  return expirationDates.map((exp) => ({
    date:
      typeof exp.date === "string"
        ? _convertDateToTimestamp(exp.date)
        : exp.date,
    qty: parseInt(exp.qty, 10),
  }));
};

export const stockManagement = {
  // Add stock to branch inventory (using backend API)
  async addStock(stockData) {
    try {
      const token = await _getAuthToken();

      // Process expiration dates
      let processedData = { ...stockData };

      // Convert single expiration date to timestamp if provided
      if (processedData.expirationDate) {
        processedData.expirationDate = _convertDateToTimestamp(
          processedData.expirationDate
        );
      }

      // Process multiple expiration dates if provided
      if (
        processedData.expirationDates &&
        Array.isArray(processedData.expirationDates)
      ) {
        processedData.expirationDates = _processExpirationDates(
          processedData.expirationDates
        );
      }

      const response = await axios.post(
        `${API_URL}inventory/stock/add`,
        processedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //   if (response.data.success) {
      //     this.success = true;
      //     this.message = response.data.message;
      //     return response.data;
      //   } else {
      //     throw new Error(response.data.message || "Failed to add stock");
      //   }

      return response.data;
    } catch (error) {
      console.error("Error adding stock:", error);

      throw error;
      //   this.error = error.response?.data?.message || error.message;
      //   return { success: false, message: this.error };
    }
  },

  // // Deduct stock from branch inventory (using backend API)
  // async deductStock(stockData) {
  //   try {
  //     const token = await _getAuthToken();

  //     // Process expiration date if provided
  //     let processedData = { ...stockData };
  //     if (processedData.expirationDate) {
  //       processedData.expirationDate = _convertDateToTimestamp(
  //         processedData.expirationDate
  //       );
  //     }

  //     const response = await axios.post(
  //       `${API_URL}inventory/stock/deduct`,
  //       processedData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     //   if (response.data.success) {
  //     //     this.success = true;
  //     //     this.message = response.data.message;
  //     //     return response.data;
  //     //   } else {
  //     //     throw new Error(response.data.message || "Failed to deduct stock");
  //     //   }
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error deducting stock:", error);
  //     this.error = error.response?.data?.message || error.message;
  //     return { success: false, message: this.error };
  //   }
  //   //  finally {
  //   //   this.loading = false;
  //   // }
  // },

  // Reject stock from branch inventory (using backend API)
  async rejectStock(stockData) {
    try {
      const token = await _getAuthToken();

      // Process expiration date if provided
      let processedData = { ...stockData };
      if (processedData.expirationDates) {
        processedData.expirationDates = _processExpirationDates(
          processedData.expirationDates
        );
      }

      const response = await axios.post(
        `${API_URL}inventory/stock/reject`,
        processedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //   if (response.data.success) {
      //     this.success = true;
      //     this.message = response.data.message;
      //     return response.data;
      //   } else {
      //     throw new Error(response.data.message || "Failed to reject stock");
      //   }

      return response.data;
    } catch (error) {
      console.error("Error rejecting stock:", error);
      //   this.error = error.response?.data?.message || error.message;
      //   return { success: false, message: this.error };
      throw error;
    }
  },

  // Transfer stock between branches (using backend API)
  async transferStock(transferData) {
    try {
      const token = await _getAuthToken();

      // Process expiration dates if provided
      let processedData = { ...transferData };

      if (processedData.expirationDates) {
        processedData.expirationDates = _processExpirationDates(
          processedData.expirationDates
        );
      }

      // // Process specific expiration dates to transfer if provided
      // if (processedData.transferExpirationDates && Array.isArray(processedData.transferExpirationDates)) {
      //     processedData.transferExpirationDates = _processExpirationDates(processedData.transferExpirationDates);
      // }

      const response = await axios.post(
        `${API_URL}inventory/stock/transfer`,
        processedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //   if (response.data.success) {
      //     this.success = true;
      //     this.message = response.data.message;
      //     return response.data;
      //   } else {
      //     throw new Error(response.data.message || "Failed to transfer stock");
      //   }

      return response.data;
    } catch (error) {
      console.error("Error transferring stock:", error);
      //   this.error = error.response?.data?.message || error.message;
      //   return { success: false, message: this.error };
      throw error;
    }
  },

  // Adjust stock count (using backend API)
  async adjustStock(adjustData) {
    try {
      const token = await _getAuthToken();

      // Process data for API
      let processedData = { ...adjustData };

      // Convert single expiration date to timestamp if provided
      if (processedData.expirationDate) {
        processedData.expirationDate = _convertDateToTimestamp(
          processedData.expirationDate
        );
      }

      // Process multiple expiration dates if provided
      if (
        processedData.expirationDates &&
        Array.isArray(processedData.expirationDates)
      ) {
        processedData.expirationDates = _processExpirationDates(
          processedData.expirationDates
        );
      }

      const response = await axios.post(
        `${API_URL}inventory/stock/adjust`,
        processedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //   if (response.data.success) {
      //     this.success = true;
      //     this.message = response.data.message;
      //     return response.data;
      //   } else {
      //     throw new Error(response.data.message || "Failed to adjust stock");
      //   }
      return response.data;
    } catch (error) {
      console.error("Error adjusting stock:", error);
      //   this.error = error.response?.data?.message || error.message;
      //   return { success: false, message: this.error };
      throw error;
    }
  },
};
