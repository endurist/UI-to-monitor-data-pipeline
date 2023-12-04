import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import './ProjectList.css';

function ProjectList({ onProjectSelect, projects, activeIndex }) {
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
            <ListGroup
                className='project-list'
                defaultActiveKey='#0'
                onClick={onProjectSelect}
                activeKey={`#${activeIndex}`}
            >
                {projects.map((project, i) => {
                    return (
                        <ListGroup.Item action href={`#${i}`} key={i}>
                            {project.name}
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </div>
    );
}

export default ProjectList;
