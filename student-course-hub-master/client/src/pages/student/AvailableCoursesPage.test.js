import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AvailableCoursesPage from './AvailableCoursesPage';
import { studentAPI } from '../../api/axiosClient';

// Mock the API module
jest.mock('../../api/axiosClient', () => ({
    studentAPI: {
        getAvailableSections: jest.fn(),
        getEnrollments: jest.fn(),
        enroll: jest.fn()
    }
}));

describe('AvailableCoursesPage', () => {
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
            availableSeats: 5,
            schedule: 'Mon 10:00',
            room: '101'
        },
        { 
            id: 2, 
            courseCode: 'MATH201', 
            courseTitle: 'Calculus', 
            instructorName: 'Prof. Jones', 
            semester: 'Spring 2026',
            availableSeats: 0,
            schedule: 'Tue 12:00',
            room: '102'
        }
    ];

    const mockEnrollments = [
        { id: 100, sectionId: 3, status: 'ENROLLED' } // Enrolled in some other course
    ];

    test('renders available sections and search input', async () => {
        studentAPI.getAvailableSections.mockResolvedValue({ data: { data: mockSections } });
        studentAPI.getEnrollments.mockResolvedValue({ data: { data: mockEnrollments } });

        render(<AvailableCoursesPage />);

        await waitFor(() => {
            expect(screen.getByText('Available Courses')).toBeInTheDocument();
        });

        // Check for search input
        expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument();

        // Check for sections
        expect(screen.getByText('CS101')).toBeInTheDocument();
        expect(screen.getByText('MATH201')).toBeInTheDocument();
        
        // Check availability badges
        expect(screen.getByText('5 seats left')).toBeInTheDocument();
        expect(screen.getByText('Full')).toBeInTheDocument(); // Badge for MATH201
    });

    test('filters sections by search query', async () => {
        studentAPI.getAvailableSections.mockResolvedValue({ data: { data: mockSections } });
        studentAPI.getEnrollments.mockResolvedValue({ data: { data: mockEnrollments } });

        render(<AvailableCoursesPage />);

        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search courses...');
        fireEvent.change(searchInput, { target: { value: 'Smith' } });

        expect(screen.getByText('CS101')).toBeInTheDocument();
        expect(screen.queryByText('MATH201')).not.toBeInTheDocument();
    });

    test('enrolls in a course', async () => {
        studentAPI.getAvailableSections.mockResolvedValue({ data: { data: [mockSections[0]] } });
        studentAPI.getEnrollments.mockResolvedValue({ data: { data: [] } });
        studentAPI.enroll.mockResolvedValue({ data: { success: true } });

        render(<AvailableCoursesPage />);

        await waitFor(() => {
            expect(screen.getByText('Enroll')).toBeInTheDocument();
        });

        const enrollButton = screen.getByText('Enroll');
        fireEvent.click(enrollButton);

        await waitFor(() => {
            expect(studentAPI.enroll).toHaveBeenCalledWith(1); // sectionId 1
        });
    });
});
