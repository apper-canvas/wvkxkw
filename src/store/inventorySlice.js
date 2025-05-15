import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchInventoryItems, getInventoryItemById, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../services/inventoryService';

// Async thunks for API operations
export const fetchAllInventoryItems = createAsyncThunk(
  'inventory/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetchInventoryItems(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInventoryItemById = createAsyncThunk(
  'inventory/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getInventoryItemById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  totalCount: 0,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllInventoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllInventoryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalCount = action.payload.totalCount || action.payload.data.length;
      })
      .addCase(fetchAllInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch inventory items';
      })
      .addCase(fetchInventoryItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchInventoryItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch inventory item';
      });
  },
});

export const { clearSelectedItem } = inventorySlice.actions;
export default inventorySlice.reducer;