import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AcademicProgressPage from './AcademicProgressPage';
import { studentAPI } from '../../api/axiosClient';

// Mock the API
jest.mock('../../api/axiosClient', () => ({
    studentAPI: {
        getAcademicProgress: jest.fn(),
        getAcademicProgressBySemester: jest.fn()
    }
}));

describe('AcademicProgressPage', () => {
    const mockFullProgress = {
        studentId: 1,
        studentName: 'John Doe',
        overallGPA: 3.5,
        totalCredits: 6,
        courseGrades: [
            {
                courseCode: 'CS101',
                courseTitle: 'Intro to CS',
                semester: 'Fall 2025',
                creditHours: 3,
                totalMarksObtained: 85,
                totalMarksPossible: 100,
                percentage: 85,
                letterGrade: 'A',
                gradePoints: 4.0
            },
            {
                courseCode: 'MATH201',
                courseTitle: 'Calculus',
                semester: 'Spring 2026',
                creditHours: 3,
                totalMarksObtained: 70,
                totalMarksPossible: 100,
                percentage: 70,
                letterGrade: 'B',
                gradePoints: 3.0
            }
        ]
    };

    const mockSemesterProgress = {
        studentId: 1,
        studentName: 'John Doe',
        overallGPA: 4.0, // GPA just for this semester
        totalCredits: 3,
        courseGrades: [
            {
                courseCode: 'CS101',
                courseTitle: 'Intro to CS',
                semester: 'Fall 2025',
                creditHours: 3,
                totalMarksObtained: 85,
                totalMarksPossible: 100,
                percentage: 85,
                letterGrade: 'A',
                gradePoints: 4.0
            }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        studentAPI.getAcademicProgress.mockResolvedValue({ data: { data: mockFullProgress } });
        studentAPI.getAcademicProgressBySemester.mockResolvedValue({ data: { data: mockSemesterProgress } });
    });

    test('renders academic progress report', async () => {
        render(<AcademicProgressPage />);

        await waitFor(() => {
            expect(screen.getByText('Academic Progress')).toBeInTheDocument();
            expect(screen.getByText('3.50')).toBeInTheDocument(); // Overall GPA
            expect(screen.getByText('CS101')).toBeInTheDocument();
            expect(screen.getByText('Intro to CS')).toBeInTheDocument();
            expect(screen.getByText('MATH201')).toBeInTheDocument();
        });
    });

    test('renders grade distribution chart', async () => {
        render(<AcademicProgressPage />);

        await waitFor(() => {
            expect(screen.getByText('Grade Distribution')).toBeInTheDocument();
            expect(screen.getByText('A Range')).toBeInTheDocument();
            expect(screen.getByText('B Range')).toBeInTheDocument();
        });
    });

    test('filters by semester', async () => {
        render(<AcademicProgressPage />);

        await waitFor(() => screen.getByText('CS101'));

        // Find select dropdown
        const select = screen.getByRole('combobox');
        
        // Check if semesters are populated (Fall 2025, Spring 2026)
        // Note: Using getAllByText because it appears in the dropdown AND the table
        expect(screen.getAllByText('Fall 2025').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Spring 2026').length).toBeGreaterThan(0);

        // Select "Fall 2025"
        fireEvent.change(select, { target: { value: 'Fall 2025' } });

        await waitFor(() => {
            expect(studentAPI.getAcademicProgressBySemester).toHaveBeenCalledWith('Fall 2025');
        });

        // Should update GPA display to semester GPA
        await waitFor(() => {
            expect(screen.getByText('4.00')).toBeInTheDocument();
        });
        
        // Should only show CS101 (mock data for semester)
        expect(screen.queryByText('MATH201')).not.toBeInTheDocument();
    });
});
