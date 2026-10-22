import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Card } from 'react-bootstrap';
import { sectionsAPI, coursesAPI, usersAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const SectionsPage = () => {
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState({
        courseId: '',
        instructorId: '',
        semester: '',
        capacity: 30,
        room: '',
        schedule: ''
    });

    const fetchData = async () => {
        try {
            const [sectionsRes, coursesRes, instructorsRes] = await Promise.all([
                sectionsAPI.getAll(),
                coursesAPI.getAll(),
                usersAPI.getInstructors()
            ]);
            setSections(sectionsRes.data.data || []);
            setCourses(coursesRes.data.data || []);
            setInstructors(instructorsRes.data.data || []);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredSections = sections.filter(section => 
        section.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.semester.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleShowModal = (section = null) => {
        if (section) {
            setEditingSection(section);
            setFormData({
                courseId: section.courseId,
                instructorId: section.instructorId,
                semester: section.semester,
                capacity: section.capacity,
                room: section.room || '',
                schedule: section.schedule || ''
            });
        } else {
            setEditingSection(null);
            setFormData({
                courseId: courses[0]?.id || '',
                instructorId: instructors[0]?.id || '',
                semester: '',
                capacity: 30,
                room: '',
                schedule: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSection(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                courseId: parseInt(formData.courseId),
                instructorId: parseInt(formData.instructorId),
                capacity: parseInt(formData.capacity)
            };

            if (editingSection) {
                await sectionsAPI.update(editingSection.id, data);
            } else {
                await sectionsAPI.create(data);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            try {
                await sectionsAPI.delete(id);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete section');
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Section Management</h2>
                    <p className="text-muted mb-0">Manage course offerings and assignments</p>
                </div>
                <div className="d-flex gap-2">
                    <Form.Control
                        type="text"
                        placeholder="Search sections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '250px' }}
                        className="shadow-sm"
                    />
                    <Button variant="primary" onClick={() => handleShowModal()} className="shadow-sm">
                        <i className="bi bi-plus-lg me-2"></i>Create Section
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow-sm border-0">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">All Sections</h5>
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
                                <th className="border-0 text-end pe-4">Actions</th>
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
                                        <span className="small text-muted">({section.enrolledCount}/{section.capacity})</span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowModal(section)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(section.id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredSections.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">
                                        {searchQuery ? 'No sections match your search.' : 'No sections found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{editingSection ? 'Edit Section' : 'Create New Section'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-3">
                        <Form.Group className="mb-3">
                            <Form.Label>Course</Form.Label>
                            <Form.Select
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                required
                            >
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.title}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Instructor</Form.Label>
                            <Form.Select
                                value={formData.instructorId}
                                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                                required
                            >
                                <option value="">Select Instructor</option>
                                {instructors.map(instructor => (
                                    <option key={instructor.id} value={instructor.id}>
                                        {instructor.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Semester</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g., Spring 2026"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Capacity</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Room</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g., Room 101"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Schedule</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g., Mon/Wed 10:00-11:30"
                                value={formData.schedule}
                                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">
                            {editingSection ? 'Save Changes' : 'Create Section'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default SectionsPage;
