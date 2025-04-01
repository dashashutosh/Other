import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../redux/userSlice";
import { useParams, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Tabs,
    Tab,
    Box,
    Grid,
    TextField,
    Button,
    InputAdornment,
} from "@mui/material";
import { AccountCircle, Email, Phone, Language, LocationCity, Business, Save } from "@mui/icons-material";

function EditUser() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) =>
        state.users.users.find((user) => user.id === id)
    );

    const [userInfo, setUserInfo] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
        website: "",
        address: {
            city: "",
            street: "",
            suite: "",
            zipcode: "",
        },
        company: {
            name: "",
            catchPhrase: "",
            bs: "",
        },
    });

    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (user) {
            setUserInfo(user);
        }
    }, [user]);

    const handleChange = (e) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setUserInfo({
            ...userInfo,
            address: { ...userInfo.address, [e.target.name]: e.target.value },
        });
    };

    const handleCompanyChange = (e) => {
        setUserInfo({
            ...userInfo,
            company: { ...userInfo.company, [e.target.name]: e.target.value },
        });
    };

    const handleUpdate = () => {
        dispatch(updateUser({ id, updatedUser: userInfo }));
        navigate("/");
    };

    return (
        <>
            {/* AppBar for Header */}
            <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
                <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
                    <Typography variant="h4" sx={{ fontWeight: "normal" }} data-testid="header-title">
                        Employee Management System
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                {/* Tabs for Section Navigation */}
                <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} centered data-testid="tabs">
                    <Tab label="Basic Details" data-testid="tab-basic" />
                    <Tab label="Address Details" data-testid="tab-address" />
                    <Tab label="Company Details" data-testid="tab-company" />
                </Tabs>

                <Box sx={{ mt: 3 }}>
                    {/* Basic Info Section */}
                    {tabIndex === 0 && (
                        <Grid container spacing={2} data-testid="basic-details-form">
                            {[
                                { label: "Name", name: "name", icon: <AccountCircle /> },
                                { label: "Username", name: "username", icon: <AccountCircle /> },
                                { label: "Email", name: "email", icon: <Email /> },
                                { label: "Phone", name: "phone", icon: <Phone /> },
                                { label: "Website", name: "website", icon: <Language /> },
                            ].map((field) => (
                                <Grid item xs={12} md={6} key={field.name}>
                                    <TextField
                                        fullWidth
                                        label={field.label}
                                        name={field.name}
                                        value={userInfo[field.name]}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: <InputAdornment position="start">{field.icon}</InputAdornment> }}
                                        data-testid={`input-${field.name}`}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Address Section */}
                    {tabIndex === 1 && (
                        <Grid container spacing={2} data-testid="address-details-form">
                            {[
                                { label: "City", name: "city" },
                                { label: "Street", name: "street" },
                                { label: "Suite", name: "suite" },
                                { label: "Zipcode", name: "zipcode" },
                            ].map((field) => (
                                <Grid item xs={12} md={6} key={field.name}>
                                    <TextField
                                        fullWidth
                                        label={field.label}
                                        name={field.name}
                                        value={userInfo.address[field.name]}
                                        onChange={handleAddressChange}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><LocationCity /></InputAdornment> }}
                                        data-testid={`input-address-${field.name}`}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    {/* Company Section */}
                    {tabIndex === 2 && (
                        <Grid container spacing={2} data-testid="company-details-form">
                            {[
                                { label: "Company Name", name: "name" },
                                { label: "Catch Phrase", name: "catchPhrase" },
                                { label: "Business Strategy", name: "bs" },
                            ].map((field) => (
                                <Grid item xs={12} md={6} key={field.name}>
                                    <TextField
                                        fullWidth
                                        label={field.label}
                                        name={field.name}
                                        value={userInfo.company[field.name]}
                                        onChange={handleCompanyChange}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
                                        data-testid={`input-company-${field.name}`}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Save Changes Button */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Save />}
                        onClick={handleUpdate}
                        data-testid="save-button"
                    >
                        Save Changes
                    </Button>
                </Box>
            </Container>
        </>
    );
}

export default EditUser;
