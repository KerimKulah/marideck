import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";

// Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: number;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface GetTasksParams {
    page?: number;
    limit?: number;
    search?: string;
    tab?: 'active' | 'completed' | 'all';
}

interface TaskState {
    tasks: Task[];
    currentTask: Task | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalTasks: number;
    totalPages: number;
    searchQuery: string;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
    statistics: {
        activeTasks: number;
        completedTasks: number;
        pendingTasks: number;
        inProgressTasks: number;
        highPriorityTasks: number;
    } | null;
    statisticsLoading: boolean;
}

const initialState: TaskState = {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    totalTasks: 0,
    totalPages: 1,
    searchQuery: '',
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    statistics: null,
    statisticsLoading: false,
};

// TASK THUNKS

export const getTasks = createAsyncThunk("task/getTasks", async ({ page, limit, search, tab }: GetTasksParams, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search !== undefined && search !== null) {
            params.append('search', search);
        }
        if (tab) params.append('tab', tab);

        const response = await api.get(`/task?${params.toString()}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Görevler yüklenirken bir hata oluştu" });
    }
});

export const getTask = createAsyncThunk("task/getTask", async (id: string, { rejectWithValue }) => {
    try {
        const response = await api.get(`/task/${id}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Görev yüklenirken bir hata oluştu" });
    }
});

export const createTask = createAsyncThunk("task/createTask", async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
        const response = await api.post("/task", taskData);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Görev oluşturulurken bir hata oluştu" });
    }
});

export const updateTask = createAsyncThunk("task/updateTask", async (payload: { id: string; data: Partial<Task> }, { rejectWithValue }) => {
    try {
        const { id, data } = payload;
        const response = await api.put(`/task/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Görev güncellenirken bir hata oluştu" });
    }
});

export const deleteTask = createAsyncThunk("task/deleteTask", async (id: string, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/task/${id}`);
        return { id: parseInt(id), ...response.data };
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Görev silinirken bir hata oluştu" });
    }
});

export const getTaskStatistics = createAsyncThunk("task/getTaskStatistics", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/task/stats');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "İstatistikler yüklenirken bir hata oluştu" });
    }
});

// SLICE

export const taskSlice = createSlice({
    name: "task",
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
        resetTaskState: () => initialState,
    },
    extraReducers: (builder) => {
        // Get Tasks
        builder.addCase(getTasks.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getTasks.fulfilled, (state, action) => {
            state.loading = false;
            state.tasks = action.payload.tasks || [];
            state.totalTasks = action.payload.tasksCount || 0;
            state.totalPages = action.payload.totalPages || 1;
            state.page = action.payload.page || 1;
            state.limit = action.payload.limit || 10;
        });
        builder.addCase(getTasks.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Görevler yüklenemedi";
        });

        // Get Single Task
        builder.addCase(getTask.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getTask.fulfilled, (state, action) => {
            state.loading = false;
            state.currentTask = action.payload;
        });
        builder.addCase(getTask.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Görev yüklenemedi";
        });

        // Create Task
        builder.addCase(createTask.pending, (state) => {
            state.createLoading = true;
            state.error = null;
        });
        builder.addCase(createTask.fulfilled, (state, action) => {
            state.createLoading = false;
            const task = action.payload.data || action.payload;
            state.tasks.unshift(task);
            state.totalTasks += 1;
        });
        builder.addCase(createTask.rejected, (state, action) => {
            state.createLoading = false;
            state.error = (action.payload as any)?.message || "Görev oluşturulamadı";
        });

        // Update Task
        builder.addCase(updateTask.pending, (state) => {
            state.updateLoading = true;
            state.error = null;
        });
        builder.addCase(updateTask.fulfilled, (state, action) => {
            state.updateLoading = false;
            const task = action.payload.data || action.payload;
            const index = state.tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
                state.tasks[index] = task;
            }
            if (state.currentTask?.id === task.id) {
                state.currentTask = task;
            }
        });
        builder.addCase(updateTask.rejected, (state, action) => {
            state.updateLoading = false;
            state.error = (action.payload as any)?.message || "Görev güncellenemedi";
        });

        // Delete Task
        builder.addCase(deleteTask.pending, (state) => {
            state.deleteLoading = true;
            state.error = null;
        });
        builder.addCase(deleteTask.fulfilled, (state, action) => {
            state.deleteLoading = false;
            state.tasks = state.tasks.filter(t => t.id !== action.payload.id);
            state.totalTasks = Math.max(0, state.totalTasks - 1);
            if (state.currentTask?.id === action.payload.id) {
                state.currentTask = null;
            }
        });
        builder.addCase(deleteTask.rejected, (state, action) => {
            state.deleteLoading = false;
            state.error = (action.payload as any)?.message || "Görev silinemedi";
        });

        // Get Task Statistics
        builder.addCase(getTaskStatistics.pending, (state) => {
            state.statisticsLoading = true;
            state.error = null;
        });
        builder.addCase(getTaskStatistics.fulfilled, (state, action) => {
            state.statisticsLoading = false;
            state.statistics = action.payload;
        });
        builder.addCase(getTaskStatistics.rejected, (state, action) => {
            state.statisticsLoading = false;
            state.error = (action.payload as any)?.message || "İstatistikler yüklenemedi";
        });
    },
});

export default taskSlice.reducer;
export const { clearError, setPage, setLimit, setSearchQuery, resetTaskState } = taskSlice.actions;

