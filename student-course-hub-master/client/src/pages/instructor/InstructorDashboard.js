import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { instructorAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const InstructorDashboard = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await instructorAPI.getSections();
                setSections(response.data.data || []);
            } catch (error) {
                console.error('Error fetching sections:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSections();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <Container>
            <div className="mb-5">
                <h2 className="mb-2 fw-bold">Instructor Dashboard</h2>
                <p className="text-muted">Manage your courses and students</p>
            </div>

            <Row className="mb-4">
                <Col md={6} className="mb-4">
                    <Card className="h-100 card-pastel-blue border-0 shadow-sm">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <Card.Title className="mb-0">My Sections</Card.Title>
                                <h1 className="display-4 fw-bold mt-2 mb-0">{sections.length}</h1>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mb-4">
                    <Card className="h-100 card-pastel-green border-0 shadow-sm">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <Card.Title className="mb-0">Total Students</Card.Title>
                                <h1 className="display-4 fw-bold mt-2 mb-0">{sections.reduce((sum, s) => sum + s.enrolledCount, 0)}</h1>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 py-3">
                    <h4 className="mb-0 fw-bold">My Sections</h4>
                </Card.Header>
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 ps-4">Course</th>
                                <th className="border-0">Semester</th>
                                <th className="border-0">Schedule</th>
                                <th className="border-0">Room</th>
                                <th className="border-0">Enrollment</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections.map(section => (
                                <tr key={section.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{section.courseCode}</div>
                                        <div className="text-muted small">{section.courseTitle}</div>
                                    </td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border">
                                            {section.semester}
                                        </Badge>
                                    </td>
                                    <td>{section.schedule || <span className="text-muted">-</span>}</td>
                                    <td>{section.room || <span className="text-muted">-</span>}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '100px', marginRight: '8px' }}>
                                                <div 
                                                    className="progress-bar bg-primary" 
                                                    role="progressbar" 
                                                    style={{ width: `${(section.enrolledCount / section.capacity) * 100}%` }}
                                                ></div>
                                            </div>
                                            <small className="text-muted">{section.enrolledCount}/{section.capacity}</small>
                                        </div>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Link to={`/instructor/sections/${section.id}`} className="btn btn-sm btn-outline-primary me-2">
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {sections.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        No sections assigned yet.
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

export default InstructorDashboard;