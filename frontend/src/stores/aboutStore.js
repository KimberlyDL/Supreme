import { defineStore } from "pinia";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useAboutStore = defineStore("about", {
  state: () => ({
    tabs: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAboutTabs() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${apiUrl}about`);
        this.tabs = response.data;
      } catch (error) {
        this.error = "Failed to fetch about information";
        console.error("Error fetching about tabs:", error);
      } finally {
        this.loading = false;
      }
    },

    async createTab(tabData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post(`${apiUrl}about/tabs`, tabData);
        this.tabs.push(response.data);
        return { success: true, message: "Tab created successfully" };
      } catch (error) {
        this.error = "Failed to create tab";
        console.error("Error creating tab:", error);
        return { success: false, message: "Failed to create tab" };
      } finally {
        this.loading = false;
      }
    },

    async updateTab(tabId, tabData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.put(
          `${apiUrl}about/tabs/${tabId}`,
          tabData
        );
        const index = this.tabs.findIndex((tab) => tab.id === tabId);
        if (index !== -1) {
          this.tabs[index] = response.data;
        }
        return { success: true, message: "Tab updated successfully" };
      } catch (error) {
        this.error = "Failed to update tab";
        console.error("Error updating tab:", error);
        return { success: false, message: "Failed to update tab" };
      } finally {
        this.loading = false;
      }
    },

    async deleteTab(tabId) {
      this.loading = true;
      this.error = null;
      try {
        await axios.delete(`${apiUrl}about/tabs/${tabId}`);
        this.tabs = this.tabs.filter((tab) => tab.id !== tabId);
        return { success: true, message: "Tab deleted successfully" };
      } catch (error) {
        this.error = "Failed to delete tab";
        console.error("Error deleting tab:", error);
        return { success: false, message: "Failed to delete tab" };
      } finally {
        this.loading = false;
      }
    },

    async reorderTabs(newOrder) {
      this.loading = true;
      this.error = null;
      try {
        await axios.put(`${apiUrl}about/reorder`, { order: newOrder });
        this.tabs = newOrder;
        return { success: true, message: "Tabs reordered successfully" };
      } catch (error) {
        this.error = "Failed to reorder tabs";
        console.error("Error reordering tabs:", error);
        return { success: false, message: "Failed to reorder tabs" };
      } finally {
        this.loading = false;
      }
    },
  },
});
