import { toast } from 'react-toastify';

/**
 * Fetches inventory items with optional filtering, pagination, and sorting
 * @param {Object} params - Query parameters
 * @returns {Promise<{data: Array, totalCount: number}>}
 */
export const fetchInventoryItems = async (params = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const queryParams = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Name" } },
        { Field: { Name: "quantity" } },
        { Field: { Name: "unit" } },
        { Field: { Name: "reorder_level" } },
        { Field: { Name: "category" } },
        { Field: { Name: "supplier" } },
        { Field: { Name: "last_restocked" } },
        { Field: { Name: "cost_per_unit" } }
      ],
      pagingInfo: params.pagingInfo || {
        limit: 20,
        offset: 0
      },
      orderBy: params.orderBy || [
        { field: "Name", direction: "ASC" }
      ]
    };

    // Add filters if provided
    if (params.filters) {
      queryParams.whereGroups = params.filters;
    }

    const response = await apperClient.fetchRecords('inventory_item', queryParams);
    
    if (!response || !response.data) {
      return { data: [], totalCount: 0 };
    }
    
    return {
      data: response.data,
      totalCount: response.totalCount || response.data.length
    };
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    toast.error("Failed to load inventory items");
    throw error;
  }
};

/**
 * Fetches a specific inventory item by ID
 * @param {number} id - The inventory item ID
 * @returns {Promise<Object>}
 */
export const getInventoryItemById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById('inventory_item', id, {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Name" } },
        { Field: { Name: "quantity" } },
        { Field: { Name: "unit" } },
        { Field: { Name: "reorder_level" } },
        { Field: { Name: "category" } },
        { Field: { Name: "supplier" } },
        { Field: { Name: "last_restocked" } },
        { Field: { Name: "cost_per_unit" } }
      ]
    });
    
    if (!response || !response.data) {
      toast.error("Inventory item not found");
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory item with ID ${id}:`, error);
    toast.error("Failed to load inventory item details");
    throw error;
  }
};

/**
 * Creates one or more new inventory items
 * @param {Object|Array} data - Inventory item data or array of inventory items
 * @returns {Promise<Object>}
 */
export const createInventoryItem = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const records = Array.isArray(data) ? data : [data];
    const params = { records };
    
    const response = await apperClient.createRecord('inventory_item', params);
    
    if (response && response.success) {
      toast.success("Inventory item created successfully");
      if (response.results && response.results.length > 0) {
        return response.results[0].data;
      }
      return { success: true };
    } else {
      toast.error("Failed to create inventory item");
      return { success: false, error: response?.message || "Unknown error" };
    }
  } catch (error) {
    console.error("Error creating inventory item:", error);
    toast.error("Failed to create inventory item");
    throw error;
  }
};

/**
 * Updates an existing inventory item
 * @param {Object} data - Inventory item data (must include Id)
 * @returns {Promise<Object>}
 */
export const updateInventoryItem = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    if (!data.Id) {
      throw new Error("Inventory item ID is required for update");
    }

    const params = { records: [data] };
    
    const response = await apperClient.updateRecord('inventory_item', params);
    
    if (response && response.success) {
      toast.success("Inventory item updated successfully");
      if (response.results && response.results.length > 0) {
        return response.results[0].data;
      }
      return { success: true };
    } else {
      toast.error("Failed to update inventory item");
      return { success: false, error: response?.message || "Unknown error" };
    }
  } catch (error) {
    console.error("Error updating inventory item:", error);
    toast.error("Failed to update inventory item");
    throw error;
  }
};

/**
 * Deletes one or more inventory items
 * @param {number|Array<number>} ids - ID or array of IDs to delete
 * @returns {Promise<boolean>}
 */
export const deleteInventoryItem = async (ids) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const recordIds = Array.isArray(ids) ? ids : [ids];
    const params = { RecordIds: recordIds };
    
    const response = await apperClient.deleteRecord('inventory_item', params);
    
    if (response && response.success) {
      toast.success("Inventory item deleted successfully");
      return true;
    } else {
      toast.error("Failed to delete inventory item");
      return false;
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    toast.error("Failed to delete inventory item");
    throw error;
  }
};