import { toast } from 'react-toastify';

/**
 * Fetches menu items with optional filtering, pagination, and sorting
 * @param {Object} params - Query parameters
 * @returns {Promise<{data: Array, totalCount: number}>}
 */
export const fetchMenuItems = async (params = {}) => {
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
        { Field: { Name: "description" } },
        { Field: { Name: "price" } },
        { Field: { Name: "category" } },
        { Field: { Name: "dietary_restrictions" } },
        { Field: { Name: "available" } },
        { Field: { Name: "image_url" } },
        { Field: { Name: "preparation_time" } }
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

    const response = await apperClient.fetchRecords('menu_item', queryParams);
    
    if (!response || !response.data) {
      return { data: [], totalCount: 0 };
    }
    
    return {
      data: response.data,
      totalCount: response.totalCount || response.data.length
    };
  } catch (error) {
    console.error("Error fetching menu items:", error);
    toast.error("Failed to load menu items");
    throw error;
  }
};

/**
 * Fetches a specific menu item by ID
 * @param {number} id - The menu item ID
 * @returns {Promise<Object>}
 */
export const getMenuItemById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById('menu_item', id, {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Name" } },
        { Field: { Name: "description" } },
        { Field: { Name: "price" } },
        { Field: { Name: "category" } },
        { Field: { Name: "dietary_restrictions" } },
        { Field: { Name: "available" } },
        { Field: { Name: "image_url" } },
        { Field: { Name: "preparation_time" } }
      ]
    });
    
    if (!response || !response.data) {
      toast.error("Menu item not found");
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu item with ID ${id}:`, error);
    toast.error("Failed to load menu item details");
    throw error;
  }
};

/**
 * Creates one or more new menu items
 * @param {Object|Array} data - Menu item data or array of menu items
 * @returns {Promise<Object>}
 */
export const createMenuItem = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const records = Array.isArray(data) ? data : [data];
    const params = { records };
    
    const response = await apperClient.createRecord('menu_item', params);
    
    if (response && response.success) {
      toast.success("Menu item created successfully");
      if (response.results && response.results.length > 0) {
        return response.results[0].data;
      }
      return { success: true };
    } else {
      toast.error("Failed to create menu item");
      return { success: false, error: response?.message || "Unknown error" };
    }
  } catch (error) {
    console.error("Error creating menu item:", error);
    toast.error("Failed to create menu item");
    throw error;
  }
};

/**
 * Updates an existing menu item
 * @param {Object} data - Menu item data (must include Id)
 * @returns {Promise<Object>}
 */
export const updateMenuItem = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    if (!data.Id) {
      throw new Error("Menu item ID is required for update");
    }

    const params = { records: [data] };
    
    const response = await apperClient.updateRecord('menu_item', params);
    
    if (response && response.success) {
      toast.success("Menu item updated successfully");
      if (response.results && response.results.length > 0) {
        return response.results[0].data;
      }
      return { success: true };
    } else {
      toast.error("Failed to update menu item");
      return { success: false, error: response?.message || "Unknown error" };
    }
  } catch (error) {
    console.error("Error updating menu item:", error);
    toast.error("Failed to update menu item");
    throw error;
  }
};

/**
 * Deletes one or more menu items
 * @param {number|Array<number>} ids - ID or array of IDs to delete
 * @returns {Promise<boolean>}
 */
export const deleteMenuItem = async (ids) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const recordIds = Array.isArray(ids) ? ids : [ids];
    const params = { RecordIds: recordIds };
    
    const response = await apperClient.deleteRecord('menu_item', params);
    
    if (response && response.success) {
      toast.success("Menu item deleted successfully");
      return true;
    } else {
      toast.error("Failed to delete menu item");
      return false;
    }
  } catch (error) {
    console.error("Error deleting menu item:", error);
    toast.error("Failed to delete menu item");
    throw error;
  }
};