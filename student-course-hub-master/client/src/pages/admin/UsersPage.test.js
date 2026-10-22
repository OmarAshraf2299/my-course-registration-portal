import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UsersPage from './UsersPage';
import { usersAPI } from '../../api/axiosClient';

// Mock the API module
jest.mock('../../api/axiosClient', () => ({
    usersAPI: {
        getAll: jest.fn(),
        getByRole: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deactivate: jest.fn(),
        activate: jest.fn()
    }
}));

describe('UsersPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders role filter and fetches all users initially', async () => {
        usersAPI.getAll.mockResolvedValue({ data: { data: [] } });

        render(<UsersPage />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByText('User Management')).toBeInTheDocument();
        });

        // Check if filter dropdown is present
        const filterSelect = screen.getByRole('combobox');
        expect(filterSelect).toBeInTheDocument();
        expect(filterSelect.value).toBe('ALL');

        // Check if getAll was called
        expect(usersAPI.getAll).toHaveBeenCalledTimes(1);
    });

    test('fetches users by role when filter is changed', async () => {
        usersAPI.getAll.mockResolvedValue({ data: { data: [] } });
        usersAPI.getByRole.mockResolvedValue({ data: { data: [] } });

        render(<UsersPage />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const filterSelect = screen.getByRole('combobox');
        
        // Change filter to ADMIN
        fireEvent.change(filterSelect, { target: { value: 'ADMIN' } });

        await waitFor(() => {
            expect(usersAPI.getByRole).toHaveBeenCalledWith('ADMIN');
        });
    });
});
