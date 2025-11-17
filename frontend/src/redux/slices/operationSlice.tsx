import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";

interface GetOperationsParams {
    page?: number;
    limit?: number;
    search?: string;
    tab?: 'my-operations-active' | 'my-operations-completed' | 'all-active' | 'all-completed';
}

// OPERATION THUNKS

export const getOperations = createAsyncThunk("operation/getOperations", async ({ page, limit, search, tab }: GetOperationsParams, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        // Always send search parameter, even if empty string (backend will handle it)
        if (search !== undefined && search !== null) {
            params.append('search', search);
        }
        if (tab) params.append('tab', tab);

        const response = await api.get(`/operation?${params.toString()}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while fetching operations" });
    }
}
);

export const getOperation = createAsyncThunk("operation/getOperation", async (id: string, { rejectWithValue }) => {
    try {
        const response = await api.get(`/operation/${id}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while fetching the operation" });
    }
}
);

export const createOperation = createAsyncThunk("operation/createOperation", async (operationData: any, { rejectWithValue }) => {
    try {
        const response = await api.post("/operation", operationData);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while creating the operation" });
    }
}
);

export const updateOperation = createAsyncThunk("operation/updateOperation", async (payload: { id: string; data: any }, { rejectWithValue }) => {
    try {
        const { id, data } = payload;
        const response = await api.put(`/operation/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while updating the operation" });
    }
}
);

export const deleteOperation = createAsyncThunk("operation/deleteOperation", async (id: string, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/operation/${id}`);
        return { id, ...response.data };
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while deleting the operation" });
    }
}
);

export const getOperationStatistics = createAsyncThunk("operation/getOperationStatistics", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/operation/stats');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while fetching operation statistics" });
    }
});

// OPERATION LOG THUNKS

export const createOperationLog = createAsyncThunk("operation/createOperationLog", async (logData: { operationId: number; description: string; createdById?: number }, { rejectWithValue }) => {
    try {
        const response = await api.post("/operation-log", logData);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while creating the operation log" });
    }
}
);

export const deleteOperationLog = createAsyncThunk("operation/deleteOperationLog", async (logId: number, { rejectWithValue }) => {
    try {
        await api.delete(`/operation-log/${logId}`);
        return { logId };
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while deleting the operation log" });
    }
}
);

// TYPES AND INITIAL STATE

interface OperationState {
    operations: any[];
    currentOperation: any | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalOperations: number;
    totalPages: number;
    searchQuery: string;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
    logs: any[];
    logsLoading: boolean;
    logsError: string | null;
    statistics: {
        myOperations?: number; // Geriye dönük uyumluluk
        myOperationsActive?: number;
        myOperationsCompleted?: number;
        activeOperations: number;
        completedOperations: number;
    } | null;
    statisticsLoading: boolean;
}

const initialState: OperationState = {
    operations: [],
    currentOperation: null,
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    totalOperations: 0,
    totalPages: 1,
    searchQuery: '',
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    logs: [],
    logsLoading: false,
    logsError: null,
    statistics: null,
    statisticsLoading: false,
};

// SLICE

export const operationSlice = createSlice({
    name: "operation",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.logsError = null;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload;
            state.page = 1; // Reset to first page when changing limit
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.page = 1; // Reset to first page when searching
        },
        resetOperationState: () => initialState,
        addOperationOptimistic: (state, action) => {
            state.operations.unshift(action.payload);
            state.totalOperations += 1;
        },
        updateOperationOptimistic: (state, action) => {
            const index = state.operations.findIndex(op => op.id === action.payload.id);
            if (index !== -1) {
                state.operations[index] = { ...state.operations[index], ...action.payload };
            }
            if (state.currentOperation?.id === action.payload.id) {
                state.currentOperation = { ...state.currentOperation, ...action.payload };
            }
        },
        removeOperationOptimistic: (state, action) => {
            state.operations = state.operations.filter(op => op.id !== action.payload);
            state.totalOperations = Math.max(0, state.totalOperations - 1);
        },
    },
    extraReducers: (builder) => {
        // Get Operations
        builder.addCase(getOperations.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getOperations.fulfilled, (state, action) => {
            state.loading = false;
            state.operations = action.payload.operations || [];
            state.totalOperations = action.payload.operationsCount || 0;
            state.totalPages = action.payload.totalPages || 1;
            state.page = action.payload.page || 1;
            state.limit = action.payload.limit || 10;
        });
        builder.addCase(getOperations.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Failed to fetch operations";
        });

        // Get Single Operation
        builder.addCase(getOperation.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getOperation.fulfilled, (state, action) => {
            state.loading = false;
            state.currentOperation = action.payload;
            state.logs = action.payload.logs || [];
        });
        builder.addCase(getOperation.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Failed to fetch operation";
        });

        // Create Operation
        builder.addCase(createOperation.pending, (state) => {
            state.createLoading = true;
            state.error = null;
        });
        builder.addCase(createOperation.fulfilled, (state, action) => {
            state.createLoading = false;
            const operation = action.payload.data || action.payload;
            state.operations.unshift(operation);
            state.totalOperations += 1;
        });
        builder.addCase(createOperation.rejected, (state, action) => {
            state.createLoading = false;
            state.error = (action.payload as any)?.message || "Failed to create operation";
        });

        // Update Operation
        builder.addCase(updateOperation.pending, (state) => {
            state.updateLoading = true;
            state.error = null;
        });
        builder.addCase(updateOperation.fulfilled, (state, action) => {
            state.updateLoading = false;
            const operation = action.payload.data || action.payload;
            const index = state.operations.findIndex(op => op.id === operation.id);
            if (index !== -1) {
                state.operations[index] = operation;
            }
            if (state.currentOperation?.id === operation.id) {
                state.currentOperation = operation;
            }
        });
        builder.addCase(updateOperation.rejected, (state, action) => {
            state.updateLoading = false;
            state.error = (action.payload as any)?.message || "Failed to update operation";
        });

        // Delete Operation
        builder.addCase(deleteOperation.pending, (state) => {
            state.deleteLoading = true;
            state.error = null;
        });
        builder.addCase(deleteOperation.fulfilled, (state, action) => {
            state.deleteLoading = false;
            state.operations = state.operations.filter(op => op.id !== action.payload.id);
            state.totalOperations = Math.max(0, state.totalOperations - 1);
            if (state.currentOperation?.id === action.payload.id) {
                state.currentOperation = null;
            }
        });
        builder.addCase(deleteOperation.rejected, (state, action) => {
            state.deleteLoading = false;
            state.error = (action.payload as any)?.message || "Failed to delete operation";
        });

        // Create Operation Log
        builder.addCase(createOperationLog.pending, (state) => {
            state.logsLoading = true;
            state.logsError = null;
        });
        builder.addCase(createOperationLog.fulfilled, (state, action) => {
            state.logsLoading = false;
            state.logs.push(action.payload);
        });
        builder.addCase(createOperationLog.rejected, (state, action) => {
            state.logsLoading = false;
            state.logsError = (action.payload as any)?.message || "Failed to create operation log";
        });

        // Delete Operation Log
        builder.addCase(deleteOperationLog.pending, (state) => {
            state.logsLoading = true;
            state.logsError = null;
        });
        builder.addCase(deleteOperationLog.fulfilled, (state, action) => {
            state.logsLoading = false;
            state.logs = state.logs.filter(log => log.id !== action.payload.logId);
        });
        builder.addCase(deleteOperationLog.rejected, (state, action) => {
            state.logsError = (action.payload as any)?.message || "Failed to delete operation log";
        });

        // Get Operation Statistics
        builder.addCase(getOperationStatistics.pending, (state) => {
            state.statisticsLoading = true;
            state.error = null;
        });
        builder.addCase(getOperationStatistics.fulfilled, (state, action) => {
            state.statisticsLoading = false;
            state.statistics = action.payload;
        });
        builder.addCase(getOperationStatistics.rejected, (state, action) => {
            state.statisticsLoading = false;
            state.error = (action.payload as any)?.message || "Failed to fetch operation statistics";
        });
    },
});

export default operationSlice.reducer;
export const { clearError, setPage, setLimit, setSearchQuery, resetOperationState, addOperationOptimistic, updateOperationOptimistic, removeOperationOptimistic } = operationSlice.actions;