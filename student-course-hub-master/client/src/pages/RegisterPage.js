import React, { useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await register(name, email, password, role);
        setLoading(false);

        if (result.success) {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData.role === 'ADMIN') navigate('/admin');
            else if (userData.role === 'INSTRUCTOR') navigate('/instructor');
            else navigate('/student');
        } else {
            setError(result.message);
        }
    };

    if (user) {
        if (user.role === 'ADMIN') return <Navigate to="/admin" />;
        if (user.role === 'INSTRUCTOR') return <Navigate to="/instructor" />;
        return <Navigate to="/student" />;
    }

    const roleOptions = [
        { value: 'STUDENT', label: 'Student', icon: '🎓', desc: 'Enroll in courses and track progress' },
        { value: 'INSTRUCTOR', label: 'Instructor', icon: '👨‍🏫', desc: 'Create and manage courses' },
        { value: 'ADMIN', label: 'Administrator', icon: '⚙️', desc: 'Full system access' }
    ];

    return (
        <div className="auth-page">
            {/* Left Panel - Branding */}
            <div className="auth-branding auth-branding-register">
                <div className="auth-branding-content">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="currentColor"/>
                                <path d="M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <span className="auth-logo-text">SmartCourseHub</span>
                    </div>

                    <div className="auth-branding-text">
                        <h1>Start Your Journey</h1>
                        <p>Join thousands of students and instructors on their path to success.</p>
                    </div>

                    <div className="auth-stats">
                        <div className="auth-stat">
                            <div className="auth-stat-number">10K+</div>
                            <div className="auth-stat-label">Students</div>
                        </div>
                        <div className="auth-stat">
                            <div className="auth-stat-number">500+</div>
                            <div className="auth-stat-label">Courses</div>
                        </div>
                        <div className="auth-stat">
                            <div className="auth-stat-number">98%</div>
                            <div className="auth-stat-label">Satisfaction</div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="auth-decoration">
                        <div className="auth-circle auth-circle-1"></div>
                        <div className="auth-circle auth-circle-2"></div>
                        <div className="auth-circle auth-circle-3"></div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="auth-form-panel">
                <div className="auth-form-container auth-form-container-register">
                    <div className="auth-form-header">
                        <h2>Create Account</h2>
                        <p>Fill in your details to get started</p>
                    </div>

                    {error && (
                        <Alert variant="danger" className="auth-alert">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                            </svg>
                            {error}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit} className="auth-form">
                        <Form.Group className="auth-input-group">
                            <Form.Label>Full Name</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="auth-input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                                    </svg>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="auth-input"
                                />
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="auth-input-group">
                            <Form.Label>Email Address</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="auth-input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="currentColor"/>
                                    </svg>
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="auth-input"
                                />
                            </InputGroup>
                        </Form.Group>

                        <div className="auth-input-row">
                            <Form.Group className="auth-input-group">
                                <Form.Label>Password</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="auth-input-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                            <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM15.1 8H8.9V6C8.9 4.29 10.29 2.9 12 2.9C13.71 2.9 15.1 4.29 15.1 6V8Z" fill="currentColor"/>
                                        </svg>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="auth-input"
                                    />
                                </InputGroup>
                            </Form.Group>

                            <Form.Group className="auth-input-group">
                                <Form.Label>Confirm Password</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="auth-input-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                                            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor"/>
                                        </svg>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="auth-input"
                                    />
                                </InputGroup>
                            </Form.Group>
                        </div>

                        <div className="auth-show-password">
                            <Form.Check
                                type="checkbox"
                                id="showPassword"
                                label="Show passwords"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                            />
                        </div>

                        <Form.Group className="auth-input-group">
                            <Form.Label>I am a...</Form.Label>
                            <div className="auth-role-selector">
                                {roleOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        className={`auth-role-option ${role === option.value ? 'active' : ''}`}
                                        onClick={() => setRole(option.value)}
                                    >
                                        <span className="auth-role-icon">{option.icon}</span>
                                        <span className="auth-role-label">{option.label}</span>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="ms-2">
                                        <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
                                    </svg>
                                </>
                            )}
                        </Button>
                    </Form>

                    <div className="auth-divider">
                        <span>Already have an account?</span>
                    </div>

                    <Link to="/login" className="auth-secondary-btn">
                        Sign In Instead
                    </Link>

                    <p className="auth-footer-text">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
