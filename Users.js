import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../redux/userSlice';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, IconButton, Typography, AppBar, Toolbar } from '@mui/material';
import { Delete, Edit, Visibility, Add } from '@mui/icons-material';

function Users() {
    const dispatch = useDispatch();
    const { users } = useSelector(state => state.users);

    useEffect(() => {
        if (!users || users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch, users]);
    

    // Extract confirm logic for easier testing
    const confirmDelete = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(userId));
        }
    };

    const handleDelete = (userId) => confirmDelete(userId);

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'username', headerName: 'Username', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'phone', headerName: 'Phone', flex: 1 },
        { field: 'website', headerName: 'Website', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        component={Link}
                        to={`/view/${params.row.id}`}
                        color="primary"
                        // data-testid={`view-button-${params.row.id}`}
                    >
                        <Visibility data-testid="VisibilityIcon" />
                    </IconButton>
                    <IconButton
                        component={Link}
                        to={`/edit/${params.row.id}`}
                        color="secondary"
                        // data-testid={`edit-button-${params.row.id}`}
                    >
                        <Edit data-testid="EditIcon" />
                    </IconButton>
                    <IconButton
                        onClick={() => handleDelete(params.row.id)}
                        color="error"
                        // data-testid={`delete-button-${params.row.id}`}
                    >
                        <Delete data-testid="DeleteIcon" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <>
            {/* Header */}
            <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "center" }} data-testid="toolbar">
                    <Typography variant="h4" sx={{ fontWeight: "normal" }} data-testid="header-title">
                        Employee Management System
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ width: "80%", margin: "auto", mt: 4 }}>
                {/* Add User Button */}
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        component={Link}
                        to="/add"
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        data-testid="add-user-button"
                    >
                        Add New User
                    </Button>
                </Box>

                {/* Users Table */}
                <Box sx={{ height: 500, width: '100%' }}>
                    <DataGrid
                        rows={users}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[5, 10, 20]}
                        checkboxSelection
                        sx={{ bgcolor: 'background.paper' }}
                        data-testid="user-table"
                    />
                </Box>
            </Box>
        </>
    );
}

export default Users;
