import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:4000/users';

// Async thunk for fetching all users
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Async thunk for fetching a single user by ID
export const fetchUserById = createAsyncThunk('users/fetchUserById', async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
});

// Async thunk for adding a user
export const addUser = createAsyncThunk('users/addUser', async (newUser) => {
    const response = await axios.post(API_URL, newUser);
    return response.data;
});

// Async thunk for updating a user
export const updateUser = createAsyncThunk('users/updateUser', async ({ id, updatedUser }) => {
    await axios.put(`${API_URL}/${id}`, updatedUser);
    return { id, updatedUser };
});

// Async thunk for deleting a user
export const deleteUser = createAsyncThunk('users/deleteUser', async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
});

const userSlice = createSlice({
    name: 'users',
    initialState: {
        users: [],
        selectedUser: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'An error occurred while fetching users.';
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.selectedUser = action.payload;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.users.push(action.payload);
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(user => user.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload.updatedUser;
                }
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(user => user.id !== action.payload);
            });
    }
});

export default userSlice.reducer;