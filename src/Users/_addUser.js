import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addUser } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Grid, Typography, Tabs, Tab, Box, InputAdornment, AppBar, Toolbar } from '@mui/material';
import { AccountCircle, Email, Phone, Language, LocationCity, Business, Add } from '@mui/icons-material';

function AddUser() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [tabIndex, setTabIndex] = useState(0);

    const [userInfo, setUserInfo] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        website: '',
        address: { city: '', street: '', suite: '', zipcode: '' },
        company: { name: '', catchPhrase: '', bs: '' }
    });

    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setUserInfo({ ...userInfo, address: { ...userInfo.address, [e.target.name]: e.target.value } });
    };

    const handleCompanyChange = (e) => {
        setUserInfo({ ...userInfo, company: { ...userInfo.company, [e.target.name]: e.target.value } });
    };

    const addNewUser = () => {
        dispatch(addUser(userInfo)).then(() => navigate('/'));
    };

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography variant="h4" sx={{ fontWeight: "normal" }}>
                        Employee Management System
                    </Typography>
                </Toolbar>
            </AppBar>

        <Container maxWidth="md" sx={{ mt: 4 }}>

            <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} centered>
                <Tab label="Basic Details" />
                <Tab label="Address Details" />
                <Tab label="Company Details" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
                {tabIndex === 0 && (
                    <Grid container spacing={2}>
                        {[{ label: 'Name', name: 'name', icon: <AccountCircle /> },
                          { label: 'Username', name: 'username', icon: <AccountCircle /> },
                          { label: 'Email', name: 'email', icon: <Email /> },
                          { label: 'Phone', name: 'phone', icon: <Phone /> },
                          { label: 'Website', name: 'website', icon: <Language /> }].map((field) => (
                            <Grid item xs={12} md={6} key={field.name}>
                                <TextField
                                    fullWidth
                                    label={field.label}
                                    name={field.name}
                                    value={userInfo[field.name]}
                                    onChange={handleChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start">{field.icon}</InputAdornment> }}
                                />

                            </Grid>
                        ))}
                    </Grid>
                )}

                {tabIndex === 1 && (
                    <Grid container spacing={2}>
                        {[{ label: 'City', name: 'city' }, { label: 'Street', name: 'street' },
                          { label: 'Suite', name: 'suite' }, { label: 'Zipcode', name: 'zipcode' }].map((field) => (
                            <Grid item xs={12} md={6} key={field.name}>
                                <TextField
                                    fullWidth
                                    label={field.label}
                                    name={field.name}
                                    value={userInfo.address[field.name]}
                                    onChange={handleAddressChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationCity /></InputAdornment> }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {tabIndex === 2 && (
                    <Grid container spacing={2}>
                        {[{ label: 'Company Name', name: 'name' },
                          { label: 'Catch Phrase', name: 'catchPhrase' },
                          { label: 'Business Strategy', name: 'bs' }].map((field) => (
                            <Grid item xs={12} md={6} key={field.name}>
                                <TextField
                                    fullWidth
                                    label={field.label}
                                    name={field.name}
                                    value={userInfo.company[field.name]}
                                    onChange={handleCompanyChange}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={addNewUser}
                >
                    Add New User
                </Button>
            </Box>
        </Container>
        </>
    );
}

export default AddUser;
