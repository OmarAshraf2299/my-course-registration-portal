import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentDashboard = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enrollmentsRes, attendanceRes] = await Promise.all([
                    studentAPI.getEnrollments(),
                    studentAPI.getAttendanceSummary()
                ]);
                setEnrollments(enrollmentsRes.data.data || []);
                setAttendanceSummary(attendanceRes.data.data || []);
            } catch (error) {
                // Ignore silent fetch errors for dashboard widgets
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getFirstName = () => {
        if (!user?.name) return 'Student';
        return user.name.split(' ')[0];
    };

    if (loading) return <LoadingSpinner />;

    const avgAttendance = attendanceSummary.length > 0
        ? Math.round(attendanceSummary.reduce((sum, s) => sum + (s.attendancePercentage || 0), 0) / attendanceSummary.length)
        : 0;

    return (
        <Container className="dashboard-container">
            {/* Welcome Section */}
            <div className="dashboard-welcome">
                <div className="welcome-content">
                    <div className="welcome-text">
                        <span className="welcome-greeting">{getGreeting()},</span>
                        <h1 className="welcome-name">{getFirstName()}!</h1>
                        <p className="welcome-subtitle">Here's an overview of your academic progress</p>
                    </div>
                    <div className="welcome-illustration">
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="100" r="80" fill="var(--primary-100)"/>
                            <circle cx="100" cy="100" r="60" fill="var(--primary-200)"/>
                            <path d="M100 50L60 75V125L100 150L140 125V75L100 50Z" fill="var(--primary-400)"/>
                            <path d="M100 50L60 75L100 100L140 75L100 50Z" fill="var(--primary-300)"/>
                            <path d="M100 100V150L140 125V75L100 100Z" fill="var(--primary-500)"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <Row className="stats-row">
                <Col md={6} lg={3} className="mb-4">
                    <div className="stat-card stat-card-primary">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{enrollments.length}</span>
                            <span className="stat-label">Enrolled Courses</span>
                        </div>
                        <Link to="/student/enrollments" className="stat-link">
                            View All
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                            </svg>
                        </Link>
                    </div>
                </Col>
                <Col md={6} lg={3} className="mb-4">
                    <div className="stat-card stat-card-success">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{avgAttendance}%</span>
                            <span className="stat-label">Avg Attendance</span>
                        </div>
                        <div className="stat-progress">
                            <ProgressBar now={avgAttendance} variant={avgAttendance >= 75 ? 'success' : 'danger'} />
                        </div>
                    </div>
                </Col>
                <Col md={6} lg={3} className="mb-4">
                    <div className="stat-card stat-card-warning">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">--</span>
                            <span className="stat-label">Current GPA</span>
                        </div>
                        <Link to="/student/grades" className="stat-link">
                            Check Grades
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                            </svg>
                        </Link>
                    </div>
                </Col>
                <Col md={6} lg={3} className="mb-4">
                    <div className="stat-card stat-card-info">
                        <div className="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">--</span>
                            <span className="stat-label">Progress</span>
                        </div>
                        <Link to="/student/progress" className="stat-link">
                            View Details
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                            </svg>
                        </Link>
                    </div>
                </Col>
            </Row>

            {/* Main Content Grid */}
            <Row>
                {/* Current Courses */}
                <Col lg={7} className="mb-4">
                    <Card className="dashboard-card">
                        <Card.Header className="dashboard-card-header">
                            <div className="card-header-content">
                                <div className="card-header-icon">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <div>
                                    <h5 className="card-header-title">My Courses</h5>
                                    <p className="card-header-subtitle">Currently enrolled courses</p>
                                </div>
                            </div>
                            <Link to="/student/courses" className="btn btn-sm btn-outline-primary">
                                Browse More
                            </Link>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {enrollments.length > 0 ? (
                                <div className="course-list">
                                    {enrollments.map(enrollment => (
                                        <div key={enrollment.id} className="course-item">
                                            <div className="course-color" style={{ background: `var(--primary-${300 + (enrollment.id % 3) * 100})` }}></div>
                                            <div className="course-info">
                                                <div className="course-main">
                                                    <span className="course-code">{enrollment.courseCode}</span>
                                                    <span className="course-title">{enrollment.courseTitle}</span>
                                                </div>
                                                <div className="course-meta">
                                                    <span className="course-instructor">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                                                        </svg>
                                                        {enrollment.instructorName || 'TBA'}
                                                    </span>
                                                    <span className="course-schedule">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor"/>
                                                        </svg>
                                                        {enrollment.schedule || 'TBA'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="course-room">
                                                <span className="room-label">Room</span>
                                                <span className="room-value">{enrollment.room || 'TBA'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <h6>No Courses Yet</h6>
                                    <p>You haven't enrolled in any courses yet.</p>
                                    <Link to="/student/courses" className="btn btn-primary btn-sm">
                                        Browse Courses
                                    </Link>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* Attendance Overview */}
                <Col lg={5} className="mb-4">
                    <Card className="dashboard-card">
                        <Card.Header className="dashboard-card-header">
                            <div className="card-header-content">
                                <div className="card-header-icon card-header-icon-success">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <div>
                                    <h5 className="card-header-title">Attendance</h5>
                                    <p className="card-header-subtitle">Your attendance record</p>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {attendanceSummary.length > 0 ? (
                                <div className="attendance-list">
                                    {attendanceSummary.map((summary, index) => (
                                        <div key={index} className="attendance-item">
                                            <div className="attendance-course">
                                                <span className="attendance-code">{summary.courseCode}</span>
                                                <div className="attendance-stats">
                                                    <span className="attendance-present">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
                                                        </svg>
                                                        {summary.presentCount} Present
                                                    </span>
                                                    <span className="attendance-absent">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM17 15.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12L17 15.59Z" fill="currentColor"/>
                                                        </svg>
                                                        {summary.absentCount} Absent
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="attendance-percentage">
                                                <div className={`percentage-circle ${summary.attendancePercentage >= 75 ? 'good' : 'low'}`}>
                                                    <span>{summary.attendancePercentage?.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
                                        </svg>
                                    </div>
                                    <h6>No Records</h6>
                                    <p>No attendance records found yet.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="dashboard-card mt-4">
                        <Card.Header className="dashboard-card-header">
                            <div className="card-header-content">
                                <div className="card-header-icon card-header-icon-warning">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <div>
                                    <h5 className="card-header-title">Quick Actions</h5>
                                    <p className="card-header-subtitle">Frequently used actions</p>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="quick-actions">
                                <Link to="/student/courses" className="quick-action-btn">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                                    </svg>
                                    Enroll in Course
                                </Link>
                                <Link to="/student/grades" className="quick-action-btn">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
                                    </svg>
                                    View Grades
                                </Link>
                                <Link to="/student/progress" className="quick-action-btn">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor"/>
                                    </svg>
                                    Track Progress
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default StudentDashboard;
