import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Badge, Form, Card } from 'react-bootstrap';
import { studentAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const AvailableCoursesPage = () => {
    const [sections, setSections] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            const [sectionsRes, enrollmentsRes] = await Promise.all([
                studentAPI.getAvailableSections(),
                studentAPI.getEnrollments()
            ]);
            setSections(sectionsRes.data.data || []);
            setEnrollments(enrollmentsRes.data.data || []);
        } catch (err) {
            setError('Failed to fetch available sections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const isEnrolled = (sectionId) => {
        return enrollments.some(e => e.sectionId === sectionId);
    };

    const handleEnroll = async (sectionId) => {
        try {
            await studentAPI.enroll(sectionId);
            setSuccess('Successfully enrolled in the course!');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enroll');
        }
    };

    const filteredSections = sections.filter(section => 
        section.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Available Courses</h2>
                    <p className="text-muted mb-0">Browse and enroll in course sections</p>
                </div>
                <Form.Control
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '300px' }}
                    className="shadow-sm"
                />
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow-sm border-0">{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} className="shadow-sm border-0">{success}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">Section List</h5>
                </Card.Header>
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 ps-4">Course</th>
                                <th className="border-0">Instructor</th>
                                <th className="border-0">Semester</th>
                                <th className="border-0">Schedule / Room</th>
                                <th className="border-0">Availability</th>
                                <th className="border-0 text-end pe-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSections.map(section => (
                                <tr key={section.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-primary">{section.courseCode}</div>
                                        <div className="small text-muted">{section.courseTitle}</div>
                                    </td>
                                    <td className="fw-medium">{section.instructorName}</td>
                                    <td>{section.semester}</td>
                                    <td>
                                        <div>{section.schedule || <span className="text-muted small">TBD</span>}</div>
                                        <div className="small text-muted">{section.room || 'No Room'}</div>
                                    </td>
                                    <td>
                                        <Badge bg={section.availableSeats > 0 ? 'success' : 'danger'} className="me-2">
                                            {section.availableSeats} seats left
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        {isEnrolled(section.id) ? (
                                            <Badge bg="info" className="px-3 py-2">Enrolled</Badge>
                                        ) : section.availableSeats > 0 ? (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleEnroll(section.id)}
                                                className="px-3"
                                            >
                                                Enroll
                                            </Button>
                                        ) : (
                                            <Badge bg="secondary" className="px-3 py-2">Full</Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredSections.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        {searchQuery ? 'No courses match your search.' : 'No available sections found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default AvailableCoursesPage;
