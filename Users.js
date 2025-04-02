import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../redux/userSlice';
import { Link } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, IconButton, Typography, AppBar, Toolbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Delete, Edit, Visibility, Add } from '@mui/icons-material';

function Users() {
    const dispatch = useDispatch();
    const { users, status, error } = useSelector(state => state.users);
    const [openErrorDialog, setOpenErrorDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        if (!users || users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch, users]);

    // Handle opening and closing the error dialog
    useEffect(() => {
        if (status === 'failed' && error) {
            setOpenErrorDialog(true);
        }
    }, [status, error]);

    // Handle opening and closing the delete confirmation dialog
    const handleOpenDeleteDialog = (userId) => {
        setUserToDelete(userId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setUserToDelete(null);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            dispatch(deleteUser(userToDelete));
            setOpenDeleteDialog(false);
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
                        <Visibility data-testid="VisibilityIcon" />
                    </IconButton>
                    <IconButton component={Link} to={`/edit/${params.row.id}`} color="secondary">
                        <Edit data-testid="EditIcon" />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDeleteDialog(params.row.id)} color="error">
                        <Delete data-testid="DeleteIcon" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    const handleCloseErrorDialog = () => {
        setOpenErrorDialog(false);
    };

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "center" }} data-testid="toolbar">
                    <Typography variant="h4" sx={{ fontWeight: "normal" }} data-testid="header-title">
                        Employee Management System
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box sx={{ width: "80%", margin: "auto", mt: 4 }}>

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

                <Box sx={{ height: 500, width: '100%' }}>
                    {status === 'succeeded' && users.length === 0 ? (
                        <Dialog open={openErrorDialog} onClose={handleCloseErrorDialog}>
                            <DialogTitle>No Users Found</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    There are no users to display.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseErrorDialog}>Close</Button>
                            </DialogActions>
                        </Dialog>
                    ) : (
                        <DataGrid
                            rows={users}
                            columns={columns}
                            pageSize={10}
                            rowsPerPageOptions={[5, 10, 20]}
                            checkboxSelection
                            sx={{ bgcolor: 'background.paper' }}
                            data-testid="user-table"
                        />
                    )}
                </Box>
            </Box>

            {/* Error Dialog */}
            {status === 'failed' && (
                <Dialog open={openErrorDialog} onClose={handleCloseErrorDialog}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {error || "An error occurred while fetching users."}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseErrorDialog}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this user?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Users;
