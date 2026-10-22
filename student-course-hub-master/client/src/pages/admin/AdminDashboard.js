import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { usersAPI, coursesAPI, sectionsAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        courses: 0,
        sections: 0,
        instructors: 0,
        students: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersRes, coursesRes, sectionsRes] = await Promise.all([
                    usersAPI.getAll(),
                    coursesAPI.getAll(),
                    sectionsAPI.getAll()
                ]);

                const users = usersRes.data.data || [];
                const instructors = users.filter(u => u.role === 'INSTRUCTOR').length;
                const students = users.filter(u => u.role === 'STUDENT').length;

                setStats({
                    users: users.length,
                    courses: (coursesRes.data.data || []).length,
                    sections: (sectionsRes.data.data || []).length,
                    instructors,
                    students
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <Container>
            <div className="mb-5">
                <h2 className="mb-2 fw-bold">Dashboard Overview</h2>
                <p className="text-muted">Welcome back, Administrator</p>
            </div>

            <Row className="mb-4">
                <Col md={4} className="mb-4">
                    <Card className="h-100 card-pastel-blue border-0 shadow-sm">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <Card.Title className="mb-0">Total Users</Card.Title>
                                <h1 className="display-4 fw-bold mt-2 mb-0">{stats.users}</h1>
                            </div>
                            <div className="mt-3">
                                <Link to="/admin/users" className="btn btn-sm btn-light text-primary rounded-pill fw-bold">
                                    Manage Users
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 card-pastel-green border-0 shadow-sm">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <Card.Title className="mb-0">Active Courses</Card.Title>
                                <h1 className="display-4 fw-bold mt-2 mb-0">{stats.courses}</h1>
                            </div>
                            <div className="mt-3">
                                <Link to="/admin/courses" className="btn btn-sm btn-light text-success rounded-pill fw-bold">
                                    Manage Courses
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="h-100 card-pastel-purple border-0 shadow-sm">
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <div>
                                <Card.Title className="mb-0">Total Sections</Card.Title>
                                <h1 className="display-4 fw-bold mt-2 mb-0">{stats.sections}</h1>
                            </div>
                            <div className="mt-3">
                                <Link to="/admin/sections" className="btn btn-sm btn-light rounded-pill fw-bold">
                                    Manage Sections
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <h4 className="mb-4 fw-bold text-muted">User Distribution</h4>
            <Row>
                <Col md={6} className="mb-4">
                    <Card className="card-pastel-orange border-0 shadow-sm">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <Card.Title className="mb-1">Instructors</Card.Title>
                                <p className="mb-0 opacity-75">Teaching Staff</p>
                            </div>
                            <h2 className="display-5 fw-bold mb-0">{stats.instructors}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mb-4">
                    <Card className="bg-light border-0 shadow-sm">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div>
                                <Card.Title className="mb-1 text-dark">Students</Card.Title>
                                <p className="mb-0 text-muted">Enrolled Learners</p>
                            </div>
                            <h2 className="display-5 fw-bold mb-0 text-dark">{stats.students}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;