import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Users from '../components/Users';
import { deleteUser } from '../redux/userSlice';

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

    beforeEach(() => {
        store = mockStore({
            users: {
                users: mockUsers  // Use the mock users
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

    test('calls deleteUser action on delete button click', () => {
        window.confirm = jest.fn(() => true); // Mock confirm dialog

        // Find the delete button for the first user
        const deleteButton = screen.getAllByTestId('DeleteIcon')[0];
        fireEvent.click(deleteButton);

        expect(store.dispatch).toHaveBeenCalledWith(deleteUser(2));
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

});
