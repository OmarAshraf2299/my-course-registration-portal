import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import { coursesAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        creditHours: 3
    });

    const fetchCourses = async () => {
        try {
            const response = await coursesAPI.getAll();
            setCourses(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course => 
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleShowModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                code: course.code,
                title: course.title,
                description: course.description || '',
                creditHours: course.creditHours
            });
        } else {
            setEditingCourse(null);
            setFormData({ code: '', title: '', description: '', creditHours: 3 });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCourse(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await coursesAPI.update(editingCourse.id, formData);
            } else {
                await coursesAPI.create(formData);
            }
            fetchCourses();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await coursesAPI.delete(id);
                fetchCourses();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete course');
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Course Management</h2>
                    <p className="text-muted mb-0">Create and manage courses</p>
                </div>
                <div className="d-flex gap-2">
                    <Form.Control
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '250px' }}
                        className="shadow-sm"
                    />
                    <Button variant="primary" onClick={() => handleShowModal()} className="shadow-sm">
                        <i className="bi bi-plus-lg me-2"></i>Add Course
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow-sm border-0">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">All Courses</h5>
                </Card.Header>
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 ps-4">Code</th>
                                <th className="border-0">Title</th>
                                <th className="border-0">Description</th>
                                <th className="border-0">Credits</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(course => (
                                <tr key={course.id}>
                                    <td className="ps-4 fw-bold text-primary">{course.code}</td>
                                    <td className="fw-medium">{course.title}</td>
                                    <td className="text-muted small" style={{maxWidth: '300px'}}>{course.description || '-'}</td>
                                    <td>
                                        <span className="badge bg-light text-dark border">
                                            {course.creditHours} CH
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowModal(course)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(course.id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCourses.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        {searchQuery ? 'No courses match your search.' : 'No courses found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{editingCourse ? 'Edit Course' : 'Create New Course'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-3">
                        <Form.Group className="mb-3">
                            <Form.Label>Course Code</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g., CS101"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g., Introduction to Programming"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Credit Hours</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                max="6"
                                value={formData.creditHours}
                                onChange={(e) => setFormData({ ...formData, creditHours: parseInt(e.target.value) })}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">
                            {editingCourse ? 'Save Changes' : 'Create Course'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default CoursesPage;