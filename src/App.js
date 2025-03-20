import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Users from './Users/Users';
import AddUser from './Users/_addUser';
import EditUser from './Users/_editUser';
import ViewUser from './Users/_viewUser';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="/add" element={<AddUser />} />
        <Route path="/edit/:id" element={<EditUser />} />
        <Route path="/view/:id" element={<ViewUser />} />
      </Routes>
    </Router>
  );
}

export default App;
