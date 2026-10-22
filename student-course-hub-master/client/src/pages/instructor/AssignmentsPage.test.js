import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssignmentsPage from './AssignmentsPage';
import { instructorAPI } from '../../api/axiosClient';

// Mock react-router-dom with virtual: true
jest.mock('react-router-dom', () => ({
    useParams: () => ({ sectionId: '1' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>
}), { virtual: true });

// Mock the API
jest.mock('../../api/axiosClient', () => ({
    instructorAPI: {
        getSectionAssignments: jest.fn(),
        getSectionById: jest.fn(),
        getAssignments: jest.fn(),
        createAssignment: jest.fn(),
        updateAssignment: jest.fn(),
        deleteAssignment: jest.fn(),
        getSubmissions: jest.fn(),
        getSectionStudents: jest.fn(),
        recordGrades: jest.fn()
    }
}));

describe('AssignmentsPage', () => {
    const mockAssignments = [
        { id: 1, title: 'Homework 1', courseCode: 'CS101', totalMarks: 10, deadline: '2026-01-01' },
        { id: 2, title: 'Project Alpha', courseCode: 'CS101', totalMarks: 50, deadline: '2026-02-01' }
    ];

    const mockSection = {
        id: 1,
        courseCode: 'CS101',
        courseTitle: 'Intro to CS'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        instructorAPI.getSectionAssignments.mockResolvedValue({ data: { data: mockAssignments } });
        instructorAPI.getSectionById.mockResolvedValue({ data: { data: mockSection } });
        instructorAPI.getAssignments.mockResolvedValue({ data: { data: [] } });
    });

    const renderComponent = () => {
        render(<AssignmentsPage />);
    };

    test('renders assignments list', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Homework 1')).toBeInTheDocument();
            expect(screen.getByText('Project Alpha')).toBeInTheDocument();
            expect(screen.getByText('CS101 - Intro to CS')).toBeInTheDocument();
        });
    });

    test('opens create modal', async () => {
        renderComponent();

        await waitFor(() => screen.getByText('Create Assignment'));
        fireEvent.click(screen.getByText('Create Assignment'));

        expect(screen.getByText('Create Assignment', { selector: '.modal-title' })).toBeInTheDocument();
    });

    test('filters assignments by search query', async () => {
        renderComponent();

        await waitFor(() => screen.getByText('Homework 1'));

        const searchInput = screen.getByPlaceholderText('Search assignments...');
        fireEvent.change(searchInput, { target: { value: 'Alpha' } });

        expect(screen.getByText('Project Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Homework 1')).not.toBeInTheDocument();
    });
});
