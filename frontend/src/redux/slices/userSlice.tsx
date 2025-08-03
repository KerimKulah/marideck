import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from '../../api/axios';

interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}

// GET USERS WITH PAGINATION AND SEARCH
export const getUsers = createAsyncThunk(
    "user/getUsers",
    async ({ page, limit, search }: GetUsersParams, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (page) params.append('page', page.toString());
            if (limit) params.append('limit', limit.toString());
            if (search) params.append('search', search);

            const response = await api.get(`/users?${params.toString()}`);
            return response.data; // { users, usersCount, page, limit, totalPages }
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while fetching users" });
        }
    }
);

// GET SINGLE USER
export const getUser = createAsyncThunk(
    "user/getUser",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while fetching the user" });
        }
    }
);

// CREATE USER
export const createUser = createAsyncThunk(
    "user/createUser",
    async (userData: any, { rejectWithValue }) => {
        try {
            const response = await api.post("/users", userData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while creating the user" });
        }
    }
);

// UPDATE USER
export const updateUser = createAsyncThunk(
    "user/updateUser",
    async (payload: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const { id, data } = payload;
            const response = await api.put(`/users/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while updating the user" });
        }
    }
);

// DELETE USER
export const deleteUser = createAsyncThunk(
    "user/deleteUser",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return { id, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while deleting the user" });
        }
    }
);

// DISABLE USER
export const disableUser = createAsyncThunk(
    "user/disableUser",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.put(`/users/${id}/disable`);
            return { id, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while disabling the user" });
        }
    }
);

// ENABLE USER
export const enableUser = createAsyncThunk(
    "user/enableUser",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.put(`/users/${id}/enable`);
            return { id, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while enabling the user" });
        }
    }
);

// UPDATE USER ROLE
export const updateUserRole = createAsyncThunk(
    "user/updateUserRole",
    async (payload: { id: number; role: string }, { rejectWithValue }) => {
        try {
            const { id, role } = payload;
            const response = await api.put(`/users/${id}/role`, { role });
            return { id, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while updating user role" });
        }
    }
);

interface UserState {
    users: any[];
    currentUser: any | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
    searchQuery: string;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
    roleUpdateLoading: boolean;
    statusUpdateLoading: boolean;
}

const initialState: UserState = {
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 1,
    searchQuery: '',
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    roleUpdateLoading: false,
    statusUpdateLoading: false,
};

export const userSlice = createSlice({
    name: "user",
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
        resetUserState: () => initialState,
        addUserOptimistic: (state, action) => {
            const newUser = { ...action.payload, id: `temp-${Date.now()}` };
            state.users.unshift(newUser);
            state.totalUsers += 1;
        },
        updateUserOptimistic: (state, action) => {
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...action.payload };
            }
            if (state.currentUser?.id === action.payload.id) {
                state.currentUser = { ...state.currentUser, ...action.payload };
            }
        },
        removeUserOptimistic: (state, action) => {
            state.users = state.users.filter(u => u.id !== action.payload);
            state.totalUsers = Math.max(0, state.totalUsers - 1);
        },
    },
    extraReducers: (builder) => {
        // GET USERS
        builder.addCase(getUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload.users || [];
            state.totalUsers = action.payload.usersCount || 0;
            state.totalPages = action.payload.totalPages || 1;
            state.page = action.payload.page || 1;
            state.limit = action.payload.limit || 10;
        });
        builder.addCase(getUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Failed to fetch users";
        });

        // GET SINGLE USER
        builder.addCase(getUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getUser.fulfilled, (state, action) => {
            state.loading = false;
            state.currentUser = action.payload;
        });
        builder.addCase(getUser.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Failed to fetch user";
        });

        // CREATE USER
        builder.addCase(createUser.pending, (state) => {
            state.createLoading = true;
            state.error = null;
        });
        builder.addCase(createUser.fulfilled, (state, action) => {
            state.createLoading = false;
            const tempIndex = state.users.findIndex(u => u.id && u.id.toString().startsWith('temp-'));
            if (tempIndex !== -1) {
                state.users[tempIndex] = action.payload;
            } else {
                state.users.unshift(action.payload);
                state.totalUsers += 1;
            }
        });
        builder.addCase(createUser.rejected, (state, action) => {
            state.createLoading = false;
            state.error = (action.payload as any)?.message || "Failed to create user";
            state.users = state.users.filter(u => !u.id || !u.id.toString().startsWith('temp-'));
            state.totalUsers = Math.max(0, state.totalUsers - 1);
        });

        // UPDATE USER
        builder.addCase(updateUser.pending, (state) => {
            state.updateLoading = true;
            state.error = null;
        });
        builder.addCase(updateUser.fulfilled, (state, action) => {
            state.updateLoading = false;
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...action.payload };
            }
            if (state.currentUser?.id === action.payload.id) {
                state.currentUser = { ...state.currentUser, ...action.payload };
            }
        });
        builder.addCase(updateUser.rejected, (state, action) => {
            state.updateLoading = false;
            state.error = (action.payload as any)?.message || "Failed to update user";
        });

        // DELETE USER
        builder.addCase(deleteUser.pending, (state) => {
            state.deleteLoading = true;
            state.error = null;
        });
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.deleteLoading = false;
            state.users = state.users.filter(u => u.id !== action.payload.id);
            state.totalUsers = Math.max(0, state.totalUsers - 1);
            if (state.currentUser?.id === action.payload.id) {
                state.currentUser = null;
            }
        });
        builder.addCase(deleteUser.rejected, (state, action) => {
            state.deleteLoading = false;
            state.error = (action.payload as any)?.message || "Failed to delete user";
        });

        // ENABLE/DISABLE USER
        const enableDisableUserFulfilled = (state: UserState, action: any) => {
            state.statusUpdateLoading = false;
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index].isActive = action.meta.arg.type === 'enable';
            }
            if (state.currentUser?.id === action.payload.id) {
                state.currentUser.isActive = action.meta.arg.type === 'enable';
            }
        };

        const enableDisableUserRejected = (state: UserState, action: any) => {
            state.statusUpdateLoading = false;
            state.error = (action.payload as any)?.message ||
                `Failed to ${action.meta.arg.type} user`;
        };

        builder.addCase(enableUser.pending, (state) => {
            state.statusUpdateLoading = true;
            state.error = null;
        });
        builder.addCase(enableUser.fulfilled, enableDisableUserFulfilled);
        builder.addCase(enableUser.rejected, enableDisableUserRejected);

        builder.addCase(disableUser.pending, (state) => {
            state.statusUpdateLoading = true;
            state.error = null;
        });
        builder.addCase(disableUser.fulfilled, enableDisableUserFulfilled);
        builder.addCase(disableUser.rejected, enableDisableUserRejected);

        // UPDATE USER ROLE
        builder.addCase(updateUserRole.pending, (state) => {
            state.roleUpdateLoading = true;
            state.error = null;
        });
        builder.addCase(updateUserRole.fulfilled, (state, action) => {
            state.roleUpdateLoading = false;
            const index = state.users.findIndex(u => u.id === action.payload.id);
            if (index !== -1) {
                state.users[index].role = action.meta.arg.role;
            }
            if (state.currentUser?.id === action.payload.id) {
                state.currentUser.role = action.meta.arg.role;
            }
        });
        builder.addCase(updateUserRole.rejected, (state, action) => {
            state.roleUpdateLoading = false;
            state.error = (action.payload as any)?.message || "Failed to update user role";
        });
    },
});

export default userSlice.reducer;
export const {
    clearError,
    setPage,
    setLimit,
    setSearchQuery,
    resetUserState,
    addUserOptimistic,
    updateUserOptimistic,
    removeUserOptimistic
} = userSlice.actions;
