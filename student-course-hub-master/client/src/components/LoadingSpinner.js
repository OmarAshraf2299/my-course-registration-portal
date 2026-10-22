import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = () => {
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>
    );
};

export default LoadingSpinner;
