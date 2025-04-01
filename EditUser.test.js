import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import EditUser from "../components/EditUser";
import { updateUser } from "../redux/userSlice";

// Mock Store Setup
const mockStore = configureStore([]);
const initialState = {
    users: {
        users: [{
            id: "2",
            name: "Kevin Howell",
            username: "Antonette",
            email: "Shanna@melissa.tv",
            address: {
                street: "Victor Plain",
                suite: "Suite 879",
                city: "Wisokyburgh",
                zipcode: "90566-7771"
            },
            phone: "010-692-6593 x09125",
            website: "anastasia.net",
            company: {
                name: "Deckow-Crist",
                catchPhrase: "Proactive didactic contingency",
                bs: "synergize scalable supply-chains"
            }
        }],
        selectedUser: {
            id: "2",
            name: "Kevin Howell",
            username: "Antonette",
            email: "Shanna@melissa.tv",
            address: {
                street: "Victor Plain",
                suite: "Suite 879",
                city: "Wisokyburgh",
                zipcode: "90566-7771"
            },
            phone: "010-692-6593 x09125",
            website: "anastasia.net",
            company: {
                name: "Deckow-Crist",
                catchPhrase: "Proactive didactic contingency",
                bs: "synergize scalable supply-chains"
            }
        }
    }
};

describe("EditUser Component", () => {
    let store;

    beforeEach(() => {
        store = mockStore(initialState);
        store.dispatch = jest.fn();
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <EditUser />
                </MemoryRouter>
            </Provider>
        );
    });

    test('renders Employee Management System header', () => {
        expect(screen.getByTestId("header-title")).toBeInTheDocument();
    });

    test("renders all input fields in Basic Details tab", () => {
        expect(screen.getByTestId("input-name")).toBeInTheDocument();
        expect(screen.getByTestId("input-email")).toBeInTheDocument();
    });

    test("switches tabs correctly", () => {
        fireEvent.click(screen.getByTestId("tab-address"));
        expect(screen.getByTestId("address-details-form")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("tab-company"));
        expect(screen.getByTestId("company-details-form")).toBeInTheDocument();
    });

    test('renders Save Changes button', () => {
            expect(screen.getByTestId('save-button')).toBeInTheDocument();
    
        });
});
