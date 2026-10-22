import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Card, Row, Col, Badge, Alert, Form } from 'react-bootstrap';
import { studentAPI } from '../../api/axiosClient';
import LoadingSpinner from '../../components/LoadingSpinner';

const AcademicProgressPage = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('ALL');

    const fetchProgress = useCallback(async (semester = 'ALL') => {
        setLoading(true);
        try {
            let response;
            if (semester === 'ALL') {
                response = await studentAPI.getAcademicProgress();
                if (semesters.length === 0 && response.data.data.courseGrades) {
                    const uniqueSemesters = [...new Set(response.data.data.courseGrades.map(c => c.semester))];
                    setSemesters(uniqueSemesters.sort());
                }
            } else {
                response = await studentAPI.getAcademicProgressBySemester(semester);
            }
            setProgress(response.data.data);
        } catch (err) {
            setError('Failed to fetch academic progress');
        } finally {
            setLoading(false);
        }
    }, [semesters.length]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    const handleSemesterChange = (e) => {
        const semester = e.target.value;
        setSelectedSemester(semester);
        fetchProgress(semester);
    };

    const getGradeBadgeColor = (letterGrade) => {
        if (['A+', 'A', 'A-'].includes(letterGrade)) return 'success';
        if (['B+', 'B', 'B-'].includes(letterGrade)) return 'primary';
        if (['C+', 'C', 'C-'].includes(letterGrade)) return 'warning';
        if (letterGrade === 'D') return 'secondary';
        return 'danger';
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!progress) return <Alert variant="info">No academic progress data available</Alert>;

    const gradeCounts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    progress.courseGrades?.forEach(c => {
        const baseGrade = c.letterGrade.charAt(0);
        if (gradeCounts[baseGrade] !== undefined) {
            gradeCounts[baseGrade]++;
        }
    });
    const maxCount = Math.max(...Object.values(gradeCounts), 1);

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Academic Progress</h2>
                    <p className="text-muted mb-0">Track your grades and GPA</p>
                </div>
                <Form.Select 
                    style={{ width: '200px' }} 
                    value={selectedSemester} 
                    onChange={handleSemesterChange}
                    className="shadow-sm"
                >
                    <option value="ALL">All Semesters</option>
                    {semesters.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                    ))}
                </Form.Select>
            </div>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e3f2fd' }}>
                        <Card.Body className="text-center">
                            <h6 className="text-primary fw-bold text-uppercase">
                                {selectedSemester === 'ALL' ? 'Overall GPA' : 'Semester GPA'}
                            </h6>
                            <h1 className="display-4 fw-bold text-primary mb-0">
                                {progress.overallGPA?.toFixed(2) || '0.00'}
                            </h1>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#e8f5e9' }}>
                        <Card.Body className="text-center">
                            <h6 className="text-success fw-bold text-uppercase">Total Credits</h6>
                            <h1 className="display-4 fw-bold text-success mb-0">
                                {progress.totalCredits || 0}
                            </h1>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#fff3e0' }}>
                        <Card.Body className="text-center">
                            <h6 className="text-warning fw-bold text-uppercase">Courses Enrolled</h6>
                            <h1 className="display-4 fw-bold text-warning mb-0">
                                {progress.courseGrades?.length || 0}
                            </h1>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col md={8}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">Detailed Report</h5>
                        </Card.Header>
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-4">Course</th>
                                        <th className="border-0">Sem</th>
                                        <th className="border-0">Credits</th>
                                        <th className="border-0">Score</th>
                                        <th className="border-0">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {progress.courseGrades?.map((course, index) => (
                                        <tr key={index}>
                                            <td className="ps-4">
                                                <div className="fw-bold">{course.courseCode}</div>
                                                <div className="text-muted small">{course.courseTitle}</div>
                                            </td>
                                            <td><Badge bg="light" text="dark" className="border">{course.semester}</Badge></td>
                                            <td>{course.creditHours}</td>
                                            <td>
                                                <div>{course.percentage?.toFixed(1)}%</div>
                                                <div className="text-muted small">
                                                    {course.totalMarksObtained?.toFixed(0)}/{course.totalMarksPossible?.toFixed(0)}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={getGradeBadgeColor(course.letterGrade)} className="px-3 py-2">
                                                    {course.letterGrade} ({course.gradePoints})
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!progress.courseGrades || progress.courseGrades.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">No data found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 fw-bold">Grade Distribution</h5>
                        </Card.Header>
                        <Card.Body>
                            {Object.entries(gradeCounts).map(([grade, count]) => (
                                <div key={grade} className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="fw-bold">{grade} Range</span>
                                        <span className="text-muted">{count} courses</span>
                                    </div>
                                    <div className="progress" style={{ height: '10px' }}>
                                        <div 
                                            className={`progress-bar bg-${getGradeBadgeColor(grade)}`} 
                                            role="progressbar" 
                                            style={{ width: `${(count / maxCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            <hr />
                            <h6 className="fw-bold mb-2">GPA Formula</h6>
                            <p className="small text-muted mb-0">
                                GPA = &Sigma;(Grade Points &times; Credits) / Total Credits
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AcademicProgressPage;
