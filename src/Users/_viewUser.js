import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchUserById } from "../redux/userSlice";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  Grid,
  CircularProgress,
  Paper,
} from "@mui/material";
import { AccountCircle, Email, Phone, Language, LocationCity, Business } from "@mui/icons-material";

function ViewUser() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedUser, loading } = useSelector((state) => state.users);

  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchUserById(id));
  }, [dispatch, id]);

  if (loading || !selectedUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* AppBar for Header */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: "normal" }}>
            Employee Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {/* Tabs for Section Navigation */}
        <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} centered>
          <Tab label="Basic Details" />
          <Tab label="Address Details" />
          <Tab label="Company Details" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {/* Basic Info Section */}
          {tabIndex === 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {[
                  { label: "Name", key: "name", icon: <AccountCircle /> },
                  { label: "Username", key: "username", icon: <AccountCircle /> },
                  { label: "Email", key: "email", icon: <Email /> },
                  { label: "Phone", key: "phone", icon: <Phone /> },
                  { label: "Website", key: "website", icon: <Language /> },
                ].map((field) => (
                  <Grid item xs={12} md={6} key={field.key}>
                    <Typography variant="body1">
                      <strong>{field.label}:</strong> {selectedUser[field.key]}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Address Section */}
          {tabIndex === 1 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {[
                  { label: "City", key: "city" },
                  { label: "Street", key: "street" },
                  { label: "Suite", key: "suite" },
                  { label: "Zipcode", key: "zipcode" },
                ].map((field) => (
                  <Grid item xs={12} md={6} key={field.key}>
                    <Typography variant="body1">
                      <strong>{field.label}:</strong> {selectedUser.address?.[field.key]}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Company Section */}
          {tabIndex === 2 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Grid container spacing={2}>
                {[
                  { label: "Company Name", key: "name" },
                  { label: "Catch Phrase", key: "catchPhrase" },
                  { label: "Business Strategy", key: "bs" },
                ].map((field) => (
                  <Grid item xs={12} md={6} key={field.key}>
                    <Typography variant="body1">
                      <strong>{field.label}:</strong> {selectedUser.company?.[field.key]}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Box>
      </Container>
    </>
  );
}

export default ViewUser;
