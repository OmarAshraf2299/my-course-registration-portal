import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Row, Col } from 'react-bootstrap';
import { studentAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const GradesPage = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await studentAPI.getGrades();
                setGrades(response.data.data || []);
            } catch (error) {
                console.error('Error fetching grades:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    if (loading) return <LoadingSpinner />;

    // Group grades by course (assuming we can derive course from assignment)
    const totalMarks = grades.reduce((sum, g) => sum + (g.obtainedMarks || 0), 0);
    const totalPossible = grades.reduce((sum, g) => sum + (g.totalMarks || 0), 0);
    const overallPercentage = totalPossible > 0 ? ((totalMarks / totalPossible) * 100).toFixed(1) : 0;

    return (
        <Container>
            <h2 className="mb-4">My Grades</h2>

            <Row className="mb-4">
                <Col md={4}>
                    <Card bg="primary" text="white">
                        <Card.Body>
                            <Card.Title>Total Assignments</Card.Title>
                            <h2>{grades.length}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card bg="success" text="white">
                        <Card.Body>
                            <Card.Title>Total Marks</Card.Title>
                            <h2>{totalMarks}/{totalPossible}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card bg="info" text="white">
                        <Card.Body>
                            <Card.Title>Overall Percentage</Card.Title>
                            <h2>{overallPercentage}%</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Assignment</th>
                        <th>Obtained Marks</th>
                        <th>Total Marks</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    {grades.map(grade => {
                        const percentage = grade.totalMarks > 0
                            ? ((grade.obtainedMarks || 0) / grade.totalMarks * 100).toFixed(1)
                            : 0;
                        return (
                            <tr key={grade.id}>
                                <td>{grade.assignmentTitle}</td>
                                <td>{grade.obtainedMarks !== null ? grade.obtainedMarks : 'Not graded'}</td>
                                <td>{grade.totalMarks}</td>
                                <td>
                                    {grade.obtainedMarks !== null ? (
                                        <Badge bg={percentage >= 50 ? 'success' : 'danger'}>
                                            {percentage}%
                                        </Badge>
                                    ) : (
                                        <Badge bg="secondary">Pending</Badge>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {grades.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center">No grades available yet</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default GradesPage;
