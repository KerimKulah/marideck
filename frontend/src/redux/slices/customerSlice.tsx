import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from '../../api/axios';

interface GetCustomersParams {
    page?: number;
    limit?: number;
    search?: string;
}

// GET CUSTOMERS WITH PAGINATION AND SEARCH
export const getCustomers = createAsyncThunk(
    "customer/getCustomers",
    async ({ page, limit, search }: GetCustomersParams, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (page) params.append('page', page.toString());
            if (limit) params.append('limit', limit.toString());
            if (search) params.append('search', search);

            const response = await api.get(`/customer?${params.toString()}`);
            return response.data; // { customers, customersCount, page, limit, totalPages }
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while fetching customers" });
        }
    }
)

// CREATE CUSTOMER 
export const createCustomer = createAsyncThunk("customer/createCustomer", async (customer: any, { rejectWithValue }) => {
    try {
        const response = await api.post("/customer", customer);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

// UPDATE CUSTOMER
export const updateCustomer = createAsyncThunk(
    "customer/updateCustomer",
    async (payload: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const { id, data } = payload;
            const response = await api.put(`/customer/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
        }
    }
)

// DELETE CUSTOMER (SOFT)
export const deleteCustomer = createAsyncThunk("customer/deleteCustomer", async (id: string, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/customer/${id}`);
        return { id, ...response.data }; // ID'yi de döndürüyoruz
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

interface CustomerState {
    customers: any[];
    customer: any | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalCustomers: number;
    totalPages: number;
    searchQuery: string;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
}

const initialState: CustomerState = {
    customers: [],
    customer: null,
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    totalCustomers: 0,
    totalPages: 1,
    searchQuery: '',
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
};

export const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload;
            state.page = 1;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.page = 1;
        },
        resetCustomerState: () => initialState,
        addCustomerOptimistic: (state, action) => {
            const newCustomer = { ...action.payload, id: `temp-${Date.now()}` };
            state.customers.unshift(newCustomer);
            state.totalCustomers += 1;
        },
        updateCustomerOptimistic: (state, action) => {
            const index = state.customers.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.customers[index] = { ...state.customers[index], ...action.payload };
            }
        },
        removeCustomerOptimistic: (state, action) => {
            state.customers = state.customers.filter(c => c.id !== action.payload);
            state.totalCustomers -= 1;
        },
    },
    extraReducers: (builder) => {
        // GET CUSTOMERS
        builder.addCase(getCustomers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(getCustomers.fulfilled, (state, action) => {
            state.loading = false;
            state.customers = action.payload.customers;
            state.totalCustomers = action.payload.customersCount;

            if (action.payload.page !== undefined) state.page = action.payload.page;
            if (action.payload.limit !== undefined) state.limit = action.payload.limit;
            if (action.payload.totalPages !== undefined) state.totalPages = action.payload.totalPages;

            state.error = null;
        })
        builder.addCase(getCustomers.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })

        // CREATE CUSTOMER
        builder.addCase(createCustomer.pending, (state) => {
            state.createLoading = true;
            state.error = null;
        })
        builder.addCase(createCustomer.fulfilled, (state, action) => {
            state.createLoading = false;

            // Optimistic update yapıldıysa temp ID'li öğeyi kaldır ve gerçek veriyi ekle
            const tempIndex = state.customers.findIndex(c => c.id && c.id.toString().startsWith('temp-'));
            if (tempIndex !== -1) {
                state.customers[tempIndex] = action.payload;
            } else {
                // Eğer optimistic update yapılmadıysa direkt ekle
                state.customers.unshift(action.payload);
                state.totalCustomers += 1;
            }

            state.error = null;
        })
        builder.addCase(createCustomer.rejected, (state, action) => {
            state.createLoading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";

            // Optimistic update başarısızsa temp öğeyi kaldır
            state.customers = state.customers.filter(c => !c.id || !c.id.toString().startsWith('temp-'));
            state.totalCustomers -= 1;
        })

        // UPDATE CUSTOMER
        builder.addCase(updateCustomer.pending, (state) => {
            state.updateLoading = true;
            state.error = null;
        })
        builder.addCase(updateCustomer.fulfilled, (state, action) => {
            state.updateLoading = false;

            // State'teki müşteriyi güncelle
            const index = state.customers.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.customers[index] = action.payload;
            }

            state.error = null;
        })
        builder.addCase(updateCustomer.rejected, (state, action) => {
            state.updateLoading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })

        // DELETE CUSTOMER
        builder.addCase(deleteCustomer.pending, (state) => {
            state.deleteLoading = true;
            state.error = null;
        })
        builder.addCase(deleteCustomer.fulfilled, (state, action) => {
            state.deleteLoading = false;

            // Müşteriyi listeden kaldır
            state.customers = state.customers.filter(c => c.id !== action.payload.id);
            state.totalCustomers -= 1;

            // Eğer sayfa boş kaldıysa ve birinci sayfa değilse, önceki sayfaya git
            if (state.customers.length === 0 && state.page > 1) {
                state.page -= 1;
            }

            state.error = null;
        })
        builder.addCase(deleteCustomer.rejected, (state, action) => {
            state.deleteLoading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })
    }
});

export default customerSlice.reducer;
export const { clearError, setPage, setLimit, setSearchQuery, resetCustomerState, addCustomerOptimistic, updateCustomerOptimistic, removeCustomerOptimistic } = customerSlice.actions;