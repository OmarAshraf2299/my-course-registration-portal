import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SectionsPage from './SectionsPage';
import { sectionsAPI, coursesAPI, usersAPI } from '../../api/axiosClient';

// Mock the API module
jest.mock('../../api/axiosClient', () => ({
    sectionsAPI: {
        getAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    },
    coursesAPI: {
        getAll: jest.fn()
    },
    usersAPI: {
        getInstructors: jest.fn()
    }
}));

describe('SectionsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockSections = [
        { 
            id: 1, 
            courseCode: 'CS101', 
            courseTitle: 'Intro to CS', 
            instructorName: 'Dr. Smith', 
            semester: 'Spring 2026',
            capacity: 30,
            enrolledCount: 10,
            availableSeats: 20
        },
        { 
            id: 2, 
            courseCode: 'MATH201', 
            courseTitle: 'Calculus', 
            instructorName: 'Prof. Jones', 
            semester: 'Fall 2025',
            capacity: 40,
            enrolledCount: 5,
            availableSeats: 35
        }
    ];

    test('renders section list and search input', async () => {
        sectionsAPI.getAll.mockResolvedValue({ data: { data: mockSections } });
        coursesAPI.getAll.mockResolvedValue({ data: { data: [] } });
        usersAPI.getInstructors.mockResolvedValue({ data: { data: [] } });

        render(<SectionsPage />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByText('Section Management')).toBeInTheDocument();
        });

        // Check search input
        const searchInput = screen.getByPlaceholderText('Search sections...');
        expect(searchInput).toBeInTheDocument();

        // Check if sections are rendered
        expect(screen.getByText('CS101')).toBeInTheDocument();
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
        expect(screen.getByText('MATH201')).toBeInTheDocument();
        expect(screen.getByText('Prof. Jones')).toBeInTheDocument();
    });

    test('filters sections by search query', async () => {
        sectionsAPI.getAll.mockResolvedValue({ data: { data: mockSections } });
        coursesAPI.getAll.mockResolvedValue({ data: { data: [] } });
        usersAPI.getInstructors.mockResolvedValue({ data: { data: [] } });

        render(<SectionsPage />);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search sections...');

        // Type 'Smith' into search (Instructor Name)
        fireEvent.change(searchInput, { target: { value: 'Smith' } });

        // CS101 (Dr. Smith) should be visible, MATH201 should not
        expect(screen.getByText('CS101')).toBeInTheDocument();
        expect(screen.queryByText('MATH201')).not.toBeInTheDocument();

        // Type 'Fall' (Semester)
        fireEvent.change(searchInput, { target: { value: 'Fall' } });
        
        // MATH201 (Fall 2025) should be visible, CS101 should not
        expect(screen.getByText('MATH201')).toBeInTheDocument();
        expect(screen.queryByText('CS101')).not.toBeInTheDocument();
    });
});
