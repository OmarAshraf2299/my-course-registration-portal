import React, { useState } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAdmin, isInstructor, isStudent } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (isAdmin) return '/admin';
        if (isInstructor) return '/instructor';
        if (isStudent) return '/student';
        return '/';
    };

    const getRoleBadge = () => {
        if (isAdmin) return { text: 'Admin', class: 'role-admin' };
        if (isInstructor) return { text: 'Instructor', class: 'role-instructor' };
        if (isStudent) return { text: 'Student', class: 'role-student' };
        return { text: 'User', class: '' };
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const role = getRoleBadge();

    return (
        <BootstrapNavbar
            expand="lg"
            className="navbar-modern"
            sticky="top"
            expanded={expanded}
            onToggle={() => setExpanded(!expanded)}
        >
            <Container>
                {/* Brand */}
                <BootstrapNavbar.Brand as={Link} to={getDashboardLink()} className="navbar-brand-modern">
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="currentColor"/>
                            <path d="M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">SmartCourseHub</span>
                        <span className={`brand-role ${role.class}`}>{role.text}</span>
                    </div>
                </BootstrapNavbar.Brand>

                {/* Mobile Toggle */}
                <BootstrapNavbar.Toggle aria-controls="main-navbar" className="navbar-toggler-modern">
                    <span className="toggler-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </BootstrapNavbar.Toggle>

                <BootstrapNavbar.Collapse id="main-navbar">
                    {user && (
                        <>
                            {/* Navigation Links */}
                            <Nav className="mx-auto navbar-nav-modern">
                                {isAdmin && (
                                    <>
                                        <Nav.Link
                                            as={Link}
                                            to="/admin"
                                            className={`nav-link-modern ${location.pathname === '/admin' ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
                                            </svg>
                                            <span>Dashboard</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/admin/users"
                                            className={`nav-link-modern ${location.pathname.includes('/admin/users') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
                                            </svg>
                                            <span>Users</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/admin/courses"
                                            className={`nav-link-modern ${location.pathname.includes('/admin/courses') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
                                            </svg>
                                            <span>Courses</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/admin/sections"
                                            className={`nav-link-modern ${location.pathname.includes('/admin/sections') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
                                            </svg>
                                            <span>Sections</span>
                                        </Nav.Link>
                                    </>
                                )}
                                {isInstructor && (
                                    <>
                                        <Nav.Link
                                            as={Link}
                                            to="/instructor"
                                            className={`nav-link-modern ${location.pathname === '/instructor' ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
                                            </svg>
                                            <span>Dashboard</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/instructor/sections"
                                            className={`nav-link-modern ${location.pathname.includes('/instructor/sections') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
                                            </svg>
                                            <span>My Sections</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/instructor/assignments"
                                            className={`nav-link-modern ${location.pathname.includes('/instructor/assignments') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1C10.7 1 9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM12 3C12.55 3 13 3.45 13 4C13 4.55 12.55 5 12 5C11.45 5 11 4.55 11 4C11 3.45 11.45 3 12 3ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor"/>
                                            </svg>
                                            <span>Assignments</span>
                                        </Nav.Link>
                                    </>
                                )}
                                {isStudent && (
                                    <>
                                        <Nav.Link
                                            as={Link}
                                            to="/student"
                                            className={`nav-link-modern ${location.pathname === '/student' ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
                                            </svg>
                                            <span>Dashboard</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/student/courses"
                                            className={`nav-link-modern ${location.pathname.includes('/student/courses') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M12 11.55C9.64 9.35 6.48 8 3 8V19C6.48 19 9.64 20.35 12 22.55C14.36 20.36 17.52 19 21 19V8C17.52 8 14.36 9.35 12 11.55ZM12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8Z" fill="currentColor"/>
                                            </svg>
                                            <span>Browse</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/student/enrollments"
                                            className={`nav-link-modern ${location.pathname.includes('/student/enrollments') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" fill="currentColor"/>
                                            </svg>
                                            <span>My Courses</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/student/grades"
                                            className={`nav-link-modern ${location.pathname.includes('/student/grades') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor"/>
                                            </svg>
                                            <span>Grades</span>
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/student/progress"
                                            className={`nav-link-modern ${location.pathname.includes('/student/progress') ? 'active' : ''}`}
                                            onClick={() => setExpanded(false)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="nav-icon">
                                                <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor"/>
                                            </svg>
                                            <span>Progress</span>
                                        </Nav.Link>
                                    </>
                                )}
                            </Nav>

                            {/* Right Side - User Menu */}
                            <Nav className="navbar-actions">
                                <Dropdown align="end" className="user-dropdown">
                                    <Dropdown.Toggle as="div" className="user-menu-toggle">
                                        <div className="user-avatar">
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="user-info d-none d-lg-block">
                                            <span className="user-name">{user.name}</span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dropdown-arrow d-none d-lg-block">
                                            <path d="M7 10L12 15L17 10H7Z" fill="currentColor"/>
                                        </svg>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="user-dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="user-avatar user-avatar-lg">
                                                {getInitials(user.name)}
                                            </div>
                                            <div className="dropdown-user-info">
                                                <span className="dropdown-user-name">{user.name}</span>
                                                <span className="dropdown-user-email">{user.email}</span>
                                                <span className={`dropdown-user-role ${role.class}`}>{role.text}</span>
                                            </div>
                                        </div>
                                        <Dropdown.Divider />
                                        <Dropdown.Item as={Link} to={getDashboardLink()} className="dropdown-item-modern">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
                                            </svg>
                                            Dashboard
                                        </Dropdown.Item>
                                        <Dropdown.Item className="dropdown-item-modern">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                                            </svg>
                                            Profile Settings
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item onClick={handleLogout} className="dropdown-item-modern dropdown-item-danger">
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                                            </svg>
                                            Sign Out
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Nav>
                        </>
                    )}
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;
