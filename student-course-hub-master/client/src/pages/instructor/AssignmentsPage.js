import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { instructorAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const AssignmentsPage = () => {
    const { sectionId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showGradesModal, setShowGradesModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [grades, setGrades] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        totalMarks: 100,
        deadline: ''
    });

    const fetchData = useCallback(async () => {
        try {
            if (sectionId) {
                const [assignmentsRes, sectionRes] = await Promise.all([
                    instructorAPI.getSectionAssignments(sectionId),
                    instructorAPI.getSectionById(sectionId)
                ]);
                setAssignments(assignmentsRes.data.data || []);
                setSection(sectionRes.data.data);
            } else {
                const response = await instructorAPI.getAssignments();
                setAssignments(response.data.data || []);
            }
        } catch (err) {
            setError('Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    }, [sectionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredAssignments = assignments.filter(assignment => 
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleShowModal = (assignment = null) => {
        if (assignment) {
            setSelectedAssignment(assignment);
            setFormData({
                title: assignment.title,
                description: assignment.description || '',
                totalMarks: assignment.totalMarks,
                deadline: assignment.deadline ? new Date(assignment.deadline).toISOString().split('T')[0] : ''
            });
        } else {
            setSelectedAssignment(null);
            setFormData({ title: '', description: '', totalMarks: 100, deadline: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedAssignment(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                sectionId: parseInt(sectionId),
                totalMarks: parseInt(formData.totalMarks),
                deadline: new Date(formData.deadline).toISOString()
            };

            if (selectedAssignment) {
                await instructorAPI.updateAssignment(selectedAssignment.id, data);
            } else {
                await instructorAPI.createAssignment(data);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await instructorAPI.deleteAssignment(id);
                fetchData();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete assignment');
            }
        }
    };

    const handleShowGrades = async (assignment) => {
        try {
            const response = await instructorAPI.getSubmissions(assignment.id);
            setSubmissions(response.data.data || []);
            setSelectedAssignment(assignment);

            const initialGrades = {};
            (response.data.data || []).forEach(s => {
                initialGrades[s.studentId] = s.obtainedMarks || 0;
            });
            setGrades(initialGrades);

            const studentsRes = await instructorAPI.getSectionStudents(assignment.sectionId);
            const allStudents = studentsRes.data.data || [];

            const mergedSubmissions = allStudents.map(student => {
                const existing = (response.data.data || []).find(s => s.studentId === student.studentId);
                return {
                    studentId: student.studentId,
                    studentName: student.studentName,
                    obtainedMarks: existing?.obtainedMarks || null
                };
            });
            setSubmissions(mergedSubmissions);

            const newGrades = {};
            mergedSubmissions.forEach(s => {
                newGrades[s.studentId] = s.obtainedMarks || 0;
            });
            setGrades(newGrades);

            setShowGradesModal(true);
        } catch (err) {
            setError('Failed to fetch submissions');
        }
    };

    const handleSaveGrades = async () => {
        try {
            const gradesData = Object.entries(grades).map(([studentId, obtainedMarks]) => ({
                studentId: parseInt(studentId),
                obtainedMarks: parseInt(obtainedMarks)
            }));

            await instructorAPI.recordGrades({
                assignmentId: selectedAssignment.id,
                grades: gradesData
            });

            setShowGradesModal(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save grades');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Assignments</h2>
                    {section && <p className="text-muted mb-0">{section.courseCode} - {section.courseTitle}</p>}
                </div>
                <div className="d-flex gap-2">
                    <Form.Control
                        type="text"
                        placeholder="Search assignments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '250px' }}
                        className="shadow-sm"
                    />
                    {sectionId && (
                        <>
                            <Link to={`/instructor/sections/${sectionId}`} className="btn btn-secondary shadow-sm">
                                Back to Section
                            </Link>
                            <Button variant="primary" onClick={() => handleShowModal()} className="shadow-sm">
                                Create Assignment
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow-sm border-0">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">Assignment List</h5>
                </Card.Header>
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 ps-4">Title</th>
                                <th className="border-0">Course</th>
                                <th className="border-0">Total Marks</th>
                                <th className="border-0">Deadline</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssignments.map(assignment => (
                                <tr key={assignment.id}>
                                    <td className="ps-4 fw-medium">{assignment.title}</td>
                                    <td>{assignment.courseCode}</td>
                                    <td>
                                        <span className="badge bg-light text-dark border">
                                            {assignment.totalMarks}
                                        </span>
                                    </td>
                                    <td>
                                        {assignment.deadline ? (
                                            <span className={new Date(assignment.deadline) < new Date() ? 'text-danger' : 'text-success'}>
                                                {new Date(assignment.deadline).toLocaleDateString()}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="outline-success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowGrades(assignment)}
                                        >
                                            Grades
                                        </Button>
                                        {sectionId && (
                                            <>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleShowModal(assignment)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(assignment.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredAssignments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">
                                        {searchQuery ? 'No assignments match your search.' : 'No assignments found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Create/Edit Assignment Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedAssignment ? 'Edit Assignment' : 'Create Assignment'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
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
                            <Form.Label>Total Marks</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={formData.totalMarks}
                                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Deadline</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">
                            {selectedAssignment ? 'Update' : 'Create'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Grades Modal */}
            <Modal show={showGradesModal} onHide={() => setShowGradesModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Grade Assignment: {selectedAssignment?.title}
                        <small className="d-block text-muted">Total Marks: {selectedAssignment?.totalMarks}</small>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Obtained Marks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map(submission => (
                                <tr key={submission.studentId}>
                                    <td>{submission.studentName}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max={selectedAssignment?.totalMarks}
                                            value={grades[submission.studentId] || 0}
                                            onChange={(e) => setGrades({
                                                ...grades,
                                                [submission.studentId]: e.target.value
                                            })}
                                            style={{ width: '100px' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGradesModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveGrades}>Save Grades</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AssignmentsPage;
