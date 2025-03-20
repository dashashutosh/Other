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
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleDelete = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            dispatch(deleteUser(userId));
        }
    };

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
                    <IconButton component={Link} to={`/view/${params.row.id}`} color="primary">
                        <Visibility />
                    </IconButton>
                    <IconButton component={Link} to={`/edit/${params.row.id}`} color="secondary">
                        <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error">
                        <Delete />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography variant="h4" sx={{ fontWeight: "normal" }}>
                        Employee Management System
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ width: "80%", margin: "auto", mt: 4 }}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button component={Link} to="/add" variant="contained" color="primary" startIcon={<Add />}>
                    Add New User
                </Button>
            </Box>
            <Box sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    checkboxSelection
                    sx={{ bgcolor: 'background.paper' }}
                />
            </Box>
            </Box>
        </>
    );
}

export default Users;
