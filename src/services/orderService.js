import { toast } from 'react-toastify';

/**
 * Fetches orders with optional filtering, pagination, and sorting
 * @param {Object} params - Query parameters
 * @returns {Promise<{data: Array, totalCount: number}>}
 */
export const fetchOrders = async (params = {}) => {
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
        { Field: { Name: "customer_name" } },
        { Field: { Name: "table_number" } },
        { Field: { Name: "order_date" } },
        { Field: { Name: "status" } },
        { Field: { Name: "payment_status" } },
        { Field: { Name: "payment_method" } },
        { Field: { Name: "total_amount" } },
        { Field: { Name: "special_instructions" } }
      ],
      pagingInfo: params.pagingInfo || {
        limit: 20,
        offset: 0
      },
      orderBy: params.orderBy || [
        { field: "order_date", direction: "DESC" }
      ]
    };

    // Add filters if provided
    if (params.filters) {
      queryParams.whereGroups = params.filters;
    }

    const response = await apperClient.fetchRecords('order1', queryParams);
    
    if (!response || !response.data) {
      return { data: [], totalCount: 0 };
    }
    
    return {
      data: response.data,
      totalCount: response.totalCount || response.data.length
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error("Failed to load orders");
    throw error;
  }
};

/**
 * Fetches a specific order by ID
 * @param {number} id - The order ID
 * @returns {Promise<Object>}
 */
export const getOrderById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById('order1', id, {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "Name" } },
        { Field: { Name: "customer_name" } },
        { Field: { Name: "table_number" } },
        { Field: { Name: "order_date" } },
        { Field: { Name: "status" } },
        { Field: { Name: "payment_status" } },
        { Field: { Name: "payment_method" } },
        { Field: { Name: "total_amount" } },
        { Field: { Name: "special_instructions" } }
      ]
    });
    
    if (!response || !response.data) {
      toast.error("Order not found");
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    toast.error("Failed to load order details");
    throw error;
  }
};

/**
 * Creates one or more new orders
 * @param {Object|Array} data - Order data or array of orders
 * @returns {Promise<Object>}
 */
export const createOrder = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const records = Array.isArray(data) ? data : [data];
    const params = { records };
    
    const response = await apperClient.createRecord('order1', params);
    
    if (response && response.success) {
      toast.success("Order created successfully");
      if (response.results && response.results.length > 0) {
        return response.results[0].data;
      }
      return { success: true };
    } else {
      toast.error("Failed to create order");
      return { success: false, error: response?.message || "Unknown error" };
    }
  } catch (error) {
    console.error("Error creating order:", error);
    toast.error("Failed to create order");
    throw error;
  }
};

/**
 * Updates an existing order
 * @param {Object} data - Order data (must include Id)
 * @returns {Promise<Object>}
 */
export const updateOrder = async (data) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    if (!data.Id) {
      throw new Error("Order ID is required for update");
    }

    const params = { records: [data] };
    
    const response = await apperClient.updateRecord('order1', params);
    
    if (response && response.success) {
      toast.success("Order updated successfully");
      if (response.results && response.results.length > 0) {
        return response.results[0].data;
      }
      return { success: true };
    } else {
      toast.error("Failed to update order");
      return { success: false, error: response?.message || "Unknown error" };
    }
  } catch (error) {
    console.error("Error updating order:", error);
    toast.error("Failed to update order");
    throw error;
  }
};

/**
 * Deletes one or more orders
 * @param {number|Array<number>} ids - ID or array of IDs to delete
 * @returns {Promise<boolean>}
 */
export const deleteOrder = async (ids) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const recordIds = Array.isArray(ids) ? ids : [ids];
    const params = { RecordIds: recordIds };
    
    const response = await apperClient.deleteRecord('order1', params);
    
    if (response && response.success) {
      toast.success("Order deleted successfully");
      return true;
    } else {
      toast.error("Failed to delete order");
      return false;
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    toast.error("Failed to delete order");
    throw error;
  }
};