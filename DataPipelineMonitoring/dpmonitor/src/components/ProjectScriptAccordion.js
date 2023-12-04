import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import './ProjectScriptAccordion.css';

function ProjectScriptAccordion({ onScriptSelect, projects }) {
    if (projects.length === 0) {
        return (
            <div className='script-list'>
                <p className='create-script-message'>
                    Create a project to begin
                </p>
            </div>
        );
    }

    return (
        <div>
            <Accordion className='accordion-list'>
                {projects.map((project, i) => {
                    return (
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle
                                    as={Button}
                                    variant='link'
                                    eventKey={`${i}`}
                                    className='toggle'
                                >
                                    {project.name}
                                </Accordion.Toggle>
                            </Card.Header>
                            {project.scripts.map((script, j) => {
                                return (
                                    <Accordion.Collapse
                                        eventKey={`${i}`}
                                        key={j}
                                    >
                                        <Card.Body
                                            className={
                                                project.scripts.length - 1 === j
                                                    ? 'last-accordion-card-body'
                                                    : 'accordion-card-body'
                                            }
                                            onClick={(e) =>
                                                onScriptSelect(e, i, j)
                                            }
                                        >
                                            {script.name}
                                        </Card.Body>
                                    </Accordion.Collapse>
                                );
                            })}
                        </Card>
                    );
                })}
            </Accordion>
        </div>
    );
}

export default ProjectScriptAccordion;
