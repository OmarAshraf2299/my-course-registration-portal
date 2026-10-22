import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SectionDetailPage from './SectionDetailPage';
import { instructorAPI } from '../../api/axiosClient';

// Mock react-router-dom with virtual: true
jest.mock('react-router-dom', () => ({
    useParams: () => ({ sectionId: '1' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>
}), { virtual: true });

// Mock the API
jest.mock('../../api/axiosClient', () => ({
    instructorAPI: {
        getSectionById: jest.fn(),
        getSectionStudents: jest.fn(),
        getSectionAttendanceByDate: jest.fn(),
        markAttendance: jest.fn()
    }
}));

describe('SectionDetailPage', () => {
    const mockSection = {
        id: 1,
        courseCode: 'CS101',
        courseTitle: 'Intro to CS',
        semester: 'Spring 2026',
        capacity: 30,
        enrolledCount: 2
    };

    const mockStudents = [
        { id: 1, studentId: 101, studentName: 'John Doe', status: 'ENROLLED' },
        { id: 2, studentId: 102, studentName: 'Jane Smith', status: 'ENROLLED' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        instructorAPI.getSectionById.mockResolvedValue({ data: { data: mockSection } });
        instructorAPI.getSectionStudents.mockResolvedValue({ data: { data: mockStudents } });
        instructorAPI.getSectionAttendanceByDate.mockResolvedValue({ data: { data: [] } });
    });

    test('renders section details and students', async () => {
        render(<SectionDetailPage />);

        await waitFor(() => {
            expect(screen.getByText('CS101 - Intro to CS')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    test('opens attendance modal and fetches data', async () => {
        render(<SectionDetailPage />);

        await waitFor(() => screen.getByText('Mark Attendance'));
        
        fireEvent.click(screen.getByText('Mark Attendance'));

        await waitFor(() => {
            expect(screen.getByText('Mark Attendance', { selector: '.modal-title' })).toBeInTheDocument();
            expect(instructorAPI.getSectionAttendanceByDate).toHaveBeenCalled();
        });
    });

    test('handles mark all present/absent', async () => {
        render(<SectionDetailPage />);

        await waitFor(() => screen.getByText('Mark Attendance'));
        fireEvent.click(screen.getByText('Mark Attendance'));

        await waitFor(() => screen.getByText('Mark All Present'));

        const checkboxes = screen.getAllByRole('checkbox');
        
        // Mark all absent
        fireEvent.click(screen.getByText('Mark All Absent'));
        checkboxes.forEach(cb => expect(cb).not.toBeChecked());

        // Mark all present
        fireEvent.click(screen.getByText('Mark All Present'));
        checkboxes.forEach(cb => expect(cb).toBeChecked());
    });
    
    test('fetches existing attendance when date changes', async () => {
        // Mock existing attendance for a specific date
        instructorAPI.getSectionAttendanceByDate.mockImplementation((id, date) => {
            if (date === '2025-01-01') {
                return Promise.resolve({
                    data: {
                        data: [{ studentId: 101, present: false }, { studentId: 102, present: true }]
                    }
                });
            }
            return Promise.resolve({ data: { data: [] } });
        });

        render(<SectionDetailPage />);

        await waitFor(() => screen.getByText('Mark Attendance'));
        fireEvent.click(screen.getByText('Mark Attendance'));

        // Change date
        const dateInput = screen.getByLabelText('Date');
        fireEvent.change(dateInput, { target: { value: '2025-01-01' } });

        await waitFor(() => {
            expect(instructorAPI.getSectionAttendanceByDate).toHaveBeenCalledWith("1", '2025-01-01');
        });
        
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).not.toBeChecked(); // John Doe (101) - false
        expect(checkboxes[1]).toBeChecked();     // Jane Smith (102) - true
    });
});