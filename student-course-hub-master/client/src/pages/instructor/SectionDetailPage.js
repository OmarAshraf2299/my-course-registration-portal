import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { instructorAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const SectionDetailPage = () => {
    const { sectionId } = useParams();
    const [section, setSection] = useState(null);
    const [students, setStudents] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Session Generation State
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [weekStartDate, setWeekStartDate] = useState('');

    // Attendance Modal State
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState({});
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sectionRes, studentsRes, sessionsRes] = await Promise.all([
                    instructorAPI.getSectionById(sectionId),
                    instructorAPI.getSectionStudents(sectionId),
                    instructorAPI.getSessions(sectionId)
                ]);
                setSection(sectionRes.data.data);
                setStudents(studentsRes.data.data || []);
                setSessions(sessionsRes.data.data || []);
            } catch (err) {
                setError('Failed to fetch section details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sectionId]);

    const handleGenerateSessions = async () => {
        if (!weekStartDate) return;
        try {
            await instructorAPI.generateSessions(sectionId, weekStartDate);
            // Re-fetch sessions to get all
            const sessionsRes = await instructorAPI.getSessions(sectionId);
            setSessions(sessionsRes.data.data);
            setSuccess('Sessions generated successfully');
            setShowGenerateModal(false);
        } catch (err) {
            setError('Failed to generate sessions');
        }
    };

    const openAttendanceModal = async (session) => {
        setSelectedSession(session);
        try {
            const res = await instructorAPI.getSessionAttendance(session.id);
            const existingRecords = res.data.data || [];
            
            const newRecords = {};
            // Default: All present if no record, or load existing
            students.forEach(s => {
                const record = existingRecords.find(r => r.studentId === s.studentId);
                newRecords[s.studentId] = record ? record.status : 'PRESENT';
            });
            
            setAttendanceRecords(newRecords);
            setShowAttendanceModal(true);
        } catch (err) {
             setError('Failed to load attendance');
        }
    };

    const handleMarkAll = (status) => {
        const newRecords = {};
        students.forEach(s => {
            newRecords[s.studentId] = status;
        });
        setAttendanceRecords(newRecords);
    };

    const handleSaveAttendance = async () => {
        try {
            const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
                studentId: parseInt(studentId),
                status
            }));

            await instructorAPI.markAttendance(selectedSession.id, records);

            setSuccess('Attendance marked successfully');
            setShowAttendanceModal(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark attendance');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!section) return <Alert variant="danger">Section not found</Alert>;

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{section.courseCode} - {section.courseTitle}</h2>
                <Link to="/instructor/sections" className="btn btn-secondary">Back</Link>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Section Details</Card.Title>
                            <p><strong>Semester:</strong> {section.semester}</p>
                            <p><strong>Schedule:</strong> {section.schedule || 'Not set'}</p>
                            <p><strong>Room:</strong> {section.room || 'Not set'}</p>
                            <p><strong>Capacity:</strong> {section.enrolledCount}/{section.capacity}</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Actions</Card.Title>
                            <div className="d-grid gap-2">
                                <Button variant="primary" onClick={() => setShowGenerateModal(true)}>
                                    Generate Weekly Sessions
                                </Button>
                                <Link to={`/instructor/sections/${sectionId}/assignments`} className="btn btn-warning">
                                    Manage Assignments
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h4 className="mt-4">Class Sessions</h4>
            {sessions.length === 0 ? (
                <Alert variant="info">No sessions scheduled. Generate sessions to start marking attendance.</Alert>
            ) : (
                <Table hover responsive>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Topic</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(session => (
                            <tr key={session.id}>
                                <td>{session.sessionDate}</td>
                                <td>{session.startTime}</td>
                                <td>{session.topic || 'Regular Session'}</td>
                                <td>
                                    <Button size="sm" variant="success" onClick={() => openAttendanceModal(session)}>
                                        Mark Attendance
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <h4 className="mt-4">Enrolled Students ({students.length})</h4>
            <Table striped bordered hover responsive size="sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student.id}>
                            <td>{student.studentId}</td>
                            <td>{student.studentName}</td>
                            <td>{student.status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Generate Sessions Modal */}
            <Modal show={showGenerateModal} onHide={() => setShowGenerateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Generate Weekly Sessions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Week Start Date (Monday)</Form.Label>
                        <Form.Control 
                            type="date" 
                            value={weekStartDate} 
                            onChange={(e) => setWeekStartDate(e.target.value)} 
                        />
                        <Form.Text className="text-muted">
                            This will create 2 sessions for the week starting from this date.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleGenerateSessions}>Generate</Button>
                </Modal.Footer>
            </Modal>

            {/* Attendance Modal */}
            <Modal show={showAttendanceModal} onHide={() => setShowAttendanceModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Mark Attendance - {selectedSession?.sessionDate} ({selectedSession?.startTime})
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex gap-2 mb-3">
                        <Button variant="outline-success" size="sm" onClick={() => handleMarkAll('PRESENT')}>All Present</Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleMarkAll('ABSENT')}>All Absent</Button>
                    </div>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.studentId}>
                                    <td>{student.studentName}</td>
                                    <td>
                                        <Form.Select 
                                            value={attendanceRecords[student.studentId]}
                                            onChange={(e) => setAttendanceRecords({
                                                ...attendanceRecords,
                                                [student.studentId]: e.target.value
                                            })}
                                        >
                                            <option value="PRESENT">Present</option>
                                            <option value="ABSENT">Absent</option>
                                            <option value="LATE">Late</option>
                                            <option value="LEAVE">Leave</option>
                                        </Form.Select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAttendanceModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveAttendance}>Save Attendance</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SectionDetailPage;