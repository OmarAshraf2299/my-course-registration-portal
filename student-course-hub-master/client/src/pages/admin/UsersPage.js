import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Badge, Card } from 'react-bootstrap';
import { usersAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filterRole, setFilterRole] = useState('ALL');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            let response;
            if (filterRole === 'ALL') {
                response = await usersAPI.getAll();
            } else {
                response = await usersAPI.getByRole(filterRole);
            }
            setUsers(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [filterRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleShowModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await usersAPI.update(editingUser.id, formData);
            } else {
                await usersAPI.create(formData);
            }
            fetchUsers();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            if (user.enabled) {
                await usersAPI.deactivate(user.id);
            } else {
                await usersAPI.activate(user.id);
            }
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await usersAPI.delete(id);
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>User Management</h2>
                    <p className="text-muted mb-0">Manage system users and permissions</p>
                </div>
                <div className="d-flex gap-2">
                    <Form.Select 
                        value={filterRole} 
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{ width: '200px' }}
                        className="shadow-sm"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="ADMIN">Administrators</option>
                        <option value="INSTRUCTOR">Instructors</option>
                        <option value="STUDENT">Students</option>
                    </Form.Select>
                    <Button variant="primary" onClick={() => handleShowModal()} className="shadow-sm">
                        <i className="bi bi-person-plus me-2"></i>Create New User
                    </Button>
                </div>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow-sm border-0">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">All Users</h5>
                </Card.Header>
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 ps-4">Name / Email</th>
                                <th className="border-0">Role</th>
                                <th className="border-0">Status</th>
                                <th className="border-0 text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{user.name}</div>
                                        <div className="text-muted small">{user.email}</div>
                                    </td>
                                    <td>
                                        <Badge bg={
                                            user.role === 'ADMIN' ? 'danger' :
                                            user.role === 'INSTRUCTOR' ? 'warning' : 'info'
                                        } className="border">
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={user.enabled ? 'success' : 'secondary'} pill>
                                            {user.enabled ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleShowModal(user)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant={user.enabled ? 'outline-warning' : 'outline-success'}
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleToggleStatus(user)}
                                        >
                                            {user.enabled ? 'Disable' : 'Enable'}
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-muted">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{editingUser ? 'Edit User' : 'Create New User'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-3">
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password {editingUser && <span className="text-muted fw-normal">(Leave blank to keep current)</span>}</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="STUDENT">Student</option>
                                <option value="INSTRUCTOR">Instructor</option>
                                <option value="ADMIN">Administrator</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">
                            {editingUser ? 'Save Changes' : 'Create User'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default UsersPage;