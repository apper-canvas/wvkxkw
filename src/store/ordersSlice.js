import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchOrders, getOrderById, createOrder, updateOrder, deleteOrder } from '../services/orderService';

// Async thunks for API operations
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetchOrders(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getOrderById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  totalCount: 0,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.totalCount = action.payload.totalCount || action.payload.data.length;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch orders';
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch order';
      });
  },
});

export const { clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;