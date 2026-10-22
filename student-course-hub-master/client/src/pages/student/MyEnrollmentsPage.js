import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Badge, Modal } from 'react-bootstrap';
import { studentAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyEnrollmentsPage = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDropModal, setShowDropModal] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    const fetchEnrollments = async () => {
        try {
            const response = await studentAPI.getAllEnrollments();
            setEnrollments(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch enrollments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const handleShowDrop = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowDropModal(true);
    };

    const handleDrop = async () => {
        try {
            await studentAPI.dropCourse(selectedEnrollment.id);
            setSuccess('Course dropped successfully');
            setShowDropModal(false);
            fetchEnrollments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to drop course');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container>
            <h2 className="mb-4">My Courses</h2>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Instructor</th>
                        <th>Semester</th>
                        <th>Schedule</th>
                        <th>Room</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {enrollments.map(enrollment => (
                        <tr key={enrollment.id}>
                            <td>{enrollment.courseCode} - {enrollment.courseTitle}</td>
                            <td>{enrollment.instructorName}</td>
                            <td>{enrollment.semester}</td>
                            <td>{enrollment.schedule || '-'}</td>
                            <td>{enrollment.room || '-'}</td>
                            <td>
                                <Badge bg={enrollment.status === 'ENROLLED' ? 'success' : 'secondary'}>
                                    {enrollment.status}
                                </Badge>
                            </td>
                            <td>
                                {enrollment.status === 'ENROLLED' && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleShowDrop(enrollment)}
                                    >
                                        Drop
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {enrollments.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center">No enrollments found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            <Modal show={showDropModal} onHide={() => setShowDropModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Drop</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to drop <strong>{selectedEnrollment?.courseCode} - {selectedEnrollment?.courseTitle}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDropModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDrop}>Drop Course</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default MyEnrollmentsPage;
