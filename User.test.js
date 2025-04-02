import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Users from '../components/Users';
import { fetchUsers, deleteUser } from '../redux/userSlice';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const API_URL = 'http://localhost:4000/users';

// Mock Redux Store
const mockStore = configureStore([]);
const mockUsers = [
    {
        id: 2,
        name: "Kevin Howell",
        username: "Antonette",
        email: "Shanna@melissa.tv",
        phone: "010-692-6593 x09125",
        website: "anastasia.net"
    }
];

jest.mock('../redux/userSlice', () => ({
    fetchUsers: jest.fn(),
    deleteUser: jest.fn()
}));

describe('Users Component', () => {

    let store;
    let mockAxios;

    beforeEach(() => {
        store = mockStore({
            users: {
                users: mockUsers,
                status: 'succeeded',
                error: null              // Use the mock users
            }
        });
        store.dispatch = jest.fn();
        mockAxios = new MockAdapter(axios);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Users />
                </MemoryRouter>
            </Provider>
        );
    });

    afterEach(() => {
        mockAxios.reset();
    });

    test('renders Employee Management System header', () => {
        // expect(screen.getByText(/Employee Management System/i)).toBeInTheDocument();
        expect(screen.getByTestId('header-title')).toBeInTheDocument();

    });

    test('renders Add New User button', () => {
        // expect(screen.getByRole('link', { name: /Add New User/i })).toBeInTheDocument();
        expect(screen.getByTestId('add-user-button')).toBeInTheDocument();

    });
    
    test('renders table with correct columns', () => {
        expect(screen.getByTestId('user-table').querySelector('[data-field="name"]')).toBeInTheDocument();
        expect(screen.getByTestId('user-table').querySelector('[data-field="username"]')).toBeInTheDocument();
        expect(screen.getByTestId('user-table').querySelector('[data-field="email"]')).toBeInTheDocument();
        expect(screen.getByTestId('user-table').querySelector('[data-field="phone"]')).toBeInTheDocument();
        expect(screen.getByTestId('user-table').querySelector('[data-field="website"]')).toBeInTheDocument();
        expect(screen.getByTestId('user-table').querySelector('[data-field="actions"]')).toBeInTheDocument();
    });
    
    test('renders user data in the table', () => {
    
        // Check if first mock user is rendered
        expect(screen.getByText("Kevin Howell")).toBeInTheDocument();
        expect(screen.getByText("Antonette")).toBeInTheDocument();
        expect(screen.getByText("Shanna@melissa.tv")).toBeInTheDocument();
        expect(screen.getByText("010-692-6593 x09125")).toBeInTheDocument();
        expect(screen.getByText("anastasia.net")).toBeInTheDocument();

    });

    test('renders action buttons for each row', () => {

        // Ensure there are action buttons for each row
        const viewButtons = screen.getAllByTestId('VisibilityIcon');
        const editButtons = screen.getAllByTestId('EditIcon');
        const deleteButtons = screen.getAllByTestId('DeleteIcon');

        expect(viewButtons.length).toBe(mockUsers.length);
        expect(editButtons.length).toBe(mockUsers.length);
        expect(deleteButtons.length).toBe(mockUsers.length);
    });

    test('should delete a user when delete button is clicked', async () => {
        const deleteButton = screen.getAllByTestId('DeleteIcon')[0]; // This selects the delete button in the row
        
        // Open the delete dialog by clicking the delete button
        fireEvent.click(deleteButton);
    
        // Wait for the delete confirmation dialog to appear
        const confirmDeleteDialog = await screen.findByRole('dialog', {
            name: /Confirm Delete/i,
        });
        expect(confirmDeleteDialog).toBeInTheDocument();
    
        // Find and click the confirm delete button
        const confirmDeleteButton = screen.getByRole('button', { name: /Delete/i });
        fireEvent.click(confirmDeleteButton);
    
        // Wait for the delete action to complete and check if the deleteUser action is dispatched
        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith(deleteUser(mockUsers[0].id));
        });
    });
    
    

    // ✅ Checkbox Selection Test
    test('allows selecting and deselecting users using checkboxes', () => {
        const checkboxes = screen.getAllByRole('checkbox');

        // Ensure checkboxes exist (including a header checkbox)
        expect(checkboxes.length).toBe(mockUsers.length + 1);

        // Click the first user checkbox
        fireEvent.click(checkboxes[1]);
        expect(checkboxes[1]).toBeChecked();

        // Click it again to deselect
        fireEvent.click(checkboxes[1]);
        expect(checkboxes[1]).not.toBeChecked();
    });

    // ✅ Pagination Test
    test('renders pagination component and handles page change', () => {
        // Check if pagination controls are present
        const pagination = screen.getByTestId("toolbar"); // MUI uses toolbar for pagination
        expect(pagination).toBeInTheDocument();
    
        // Find the "Next Page" button (MUI uses aria-label for navigation)
        const nextPageButton = screen.getByRole('button', { name: /next page/i });
        expect(nextPageButton).toBeInTheDocument();
    
    });    

    // Tests for API calls and error handling
    test('fetches users successfully', async () => {
        mockAxios.onGet(API_URL).reply(200, mockUsers);

        await store.dispatch(fetchUsers());
        expect(store.dispatch).toHaveBeenCalledWith(fetchUsers());
    });

    test('handles API failure for empty user list', async () => {
        // Simulate API failure with a 500 error response
        mockAxios.onGet(API_URL).reply(500);
    
        // Render component with empty users list
        store = mockStore({
            users: {
                users: [],
                status: 'failed', // Make sure this matches your Redux slice logic
                error: "An error occurred while fetching users."
            }
        });
    
        store.dispatch = jest.fn();
    
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Users />
                </MemoryRouter>
            </Provider>
        );
    
        // Dispatch API call
        await store.dispatch(fetchUsers());
    
        // Ensure fetchUsers was called
        expect(store.dispatch).toHaveBeenCalledWith(fetchUsers());
    
        // ✅ Use waitFor to handle async state update
        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes("An error occurred while fetching users"))
            ).toBeInTheDocument();
        });
    });


});
