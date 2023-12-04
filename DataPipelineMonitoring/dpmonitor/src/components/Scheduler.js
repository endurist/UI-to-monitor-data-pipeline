import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function Scheduler({ show, handleClose, handleSave, scriptName }) {
    const [cronString, setCronString] = useState();

    return (
        <Modal show={show} onHide={handleClose} animation={true}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Enter Cron String for <strong>{scriptName}</strong>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Control
                    type='text'
                    placeholder='0-59 0-23 1-31 1-12 0-7'
                    onChange={(e) => setCronString(e.target.value)}
                />
            </Modal.Body>

            <Modal.Footer>
                <Button variant='secondary' onClick={handleClose}>
                    Close
                </Button>
                <Button
                    variant='primary'
                    onClick={(e) => handleSave(e, cronString)}
                >
                    Schedule Script
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default Scheduler;
