import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoursesPage from './CoursesPage';
import { coursesAPI } from '../../api/axiosClient';

// Mock the API module
jest.mock('../../api/axiosClient', () => ({
    coursesAPI: {
        getAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
}));

describe('CoursesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCourses = [
        { id: 1, code: 'CS101', title: 'Intro to CS', description: 'Basics', creditHours: 3 },
        { id: 2, code: 'MATH201', title: 'Calculus', description: 'Math stuff', creditHours: 4 }
    ];

    test('renders course list and search input', async () => {
        coursesAPI.getAll.mockResolvedValue({ data: { data: mockCourses } });

        render(<CoursesPage />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByText('Course Management')).toBeInTheDocument();
        });

        // Check search input
        const searchInput = screen.getByPlaceholderText('Search courses...');
        expect(searchInput).toBeInTheDocument();

        // Check if courses are rendered
        expect(screen.getByText('CS101')).toBeInTheDocument();
        expect(screen.getByText('MATH201')).toBeInTheDocument();
    });

    test('filters courses by search query', async () => {
        coursesAPI.getAll.mockResolvedValue({ data: { data: mockCourses } });

        render(<CoursesPage />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search courses...');

        // Type 'Math' into search
        fireEvent.change(searchInput, { target: { value: 'Math' } });

        // MATH201 should be visible, CS101 should not
        expect(screen.getByText('MATH201')).toBeInTheDocument();
        expect(screen.queryByText('CS101')).not.toBeInTheDocument();
    });
});
