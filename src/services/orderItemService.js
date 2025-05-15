import { toast } from 'react-toastify';

/**
 * Fetches order items with optional filtering, pagination, and sorting
 * @param {Object} params - Query parameters
 * @returns {Promise<{data: Array, totalCount: number}>}
 */
export const fetchOrderItems = async (params = {}) => {
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
        { Field: { Name: "menu_item" } },
        { Field: { Name: "order" } },
        { Field: { Name: "quantity" } },
        { Field: { Name: "price" } },
        { Field: { Name: "customizations" } }
      ],
      pagingInfo: params.pagingInfo || {
        limit: 100,
        offset: 0
      },
      orderBy: params.orderBy || [
        { field: "Name", direction: "ASC" }
      ]
    };

    // Add filters if provided
    if (params.orderId) {
      queryParams.whereGroups = [{
        operator: "AND",
        subGroups: [{
          conditions: [{
            FieldName: "order",
            operator: "ExactMatch",
            values: [params.orderId]
          }],
          operator: ""
        }]
      }];
    }

    const response = await apperClient.fetchRecords('order_item', queryParams);
    
    if (!response || !response.data) {
      return { data: [], totalCount: 0 };
    }
    
    return {
      data: response.data,
      totalCount: response.totalCount || response.data.length
    };
  } catch (error) {
    console.error("Error fetching order items:", error);
    toast.error("Failed to load order items");
    throw error;
  }
};

/**
 * Fetches a specific order item by ID
 * @param {number} id - The order item ID
 * @returns {Promise<Object>}
 */
export const getOrderItemById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById('order_item', id, {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Name" } },
        { Field: { Name: "menu_item" } },
        { Field: { Name: "order" } },
        { Field: { Name: "quantity" } },
        { Field: { Name: "price" } },
        { Field: { Name: "customizations" } }
      ]
    });
    
    if (!response || !response.data) {
      toast.error("Order item not found");
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching order item with ID ${id}:`, error);
    toast.error("Failed to load order item details");
    throw error;
  }
};

/**
 * Creates one or more new order items
 * @param {Object|Array} data - Order item data or array of order items
 * @returns {Promise<Object>}
 */
export const createOrderItem = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const records = Array.isArray(data) ? data : [data];
    const params = { records };
    
    const response = await apperClient.createRecord('order_item', params);
    
    if (response && response.success) {
      toast.success("Order item added successfully");
      if (response.results && response.results.length > 0) {
        return response.results[0].data;
      }
      return { success: true };
    } else {
      toast.error("Failed to add order item");
      return { success: false, error: response?.message || "Unknown error" };
    }
  } catch (error) {
    console.error("Error creating order item:", error);
    toast.error("Failed to add order item");
    throw error;
  }
};

/**
 * Updates an existing order item
 * @param {Object} data - Order item data (must include Id)
 * @returns {Promise<Object>}
 */
export const updateOrderItem = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    if (!data.Id) {
      throw new Error("Order item ID is required for update");
    }

    const params = { records: [data] };
    
    const response = await apperClient.updateRecord('order_item', params);
    
    if (response && response.success) {
      toast.success("Order item updated successfully");
      if (response.results && response.results.length > 0) {
        return response.results[0].data;
      }
      return { success: true };
    } else {
      toast.error("Failed to update order item");
      return { success: false, error: response?.message || "Unknown error" };
    }
  } catch (error) {
    console.error("Error updating order item:", error);
    toast.error("Failed to update order item");
    throw error;
  }
};

/**
 * Deletes one or more order items
 * @param {number|Array<number>} ids - ID or array of IDs to delete
 * @returns {Promise<boolean>}
 */
export const deleteOrderItem = async (ids) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const recordIds = Array.isArray(ids) ? ids : [ids];
    const params = { RecordIds: recordIds };
    
    const response = await apperClient.deleteRecord('order_item', params);
    
    if (response && response.success) {
      toast.success("Order item removed successfully");
      return true;
    } else {
      toast.error("Failed to remove order item");
      return false;
    }
  } catch (error) {
    console.error("Error deleting order item:", error);
    toast.error("Failed to remove order item");
    throw error;
  }
};