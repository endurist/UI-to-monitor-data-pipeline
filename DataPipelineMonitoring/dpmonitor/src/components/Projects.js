import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import './Projects.css';
import { useHistory } from 'react-router-dom';
import { GoPlusSmall } from 'react-icons/go';
import { FiSettings } from 'react-icons/fi';
import { IconContext } from 'react-icons/lib';

function Projects({ token, projects, setSelectedProjectIndex, setProjects }) {
    let history = useHistory();

    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
    const [createModalFormValue, setCreateModalFormValue] = useState();
    const [showRenameProjectModal, setShowRenameProjectModal] = useState(false);
    const [renameModalFormValue, setRenameModalFormValue] = useState();
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareModalFormValue, setShareModalFormValue] = useState();
    const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
    const [removeUserModalFormValue, setRemoveUserModalFormValue] = useState();
    const [shareRoleValue, setShareRoleValue] = useState();
    const [defaultRoleValue, setDefaultRoleValue] = useState();
    const [showManageDataModal, setShowManageDataModal] = useState(false);
    const [dataLifetimeString, setDataLifetimeString] = useState();
    const [showAlert, setShowAlert] = useState(false);
    const [alertText, setAlertText] = useState();
    const [alertVariant, setAlertVariant] = useState();

    const handleCreateModalClose = () => setShowCreateProjectModal(false);
    const handleCreateModalShow = () => setShowCreateProjectModal(true);
    const handleRenameModalClose = () => setShowRenameProjectModal(false);
    const handleRenameModalShow = (index) => {
        setCurrentProjectIndex(index);
        setShowRenameProjectModal(true);
    };
    const handleRemoveUserModalClose = () => setShowRemoveUserModal(false);
    const handleRemoveUserModalShow = (index) => {
        setCurrentProjectIndex(index);
        setShowRemoveUserModal(true);
    };
    const handleShareModalClose = () => setShowShareModal(false);
    const handleShareModalShow = (index) => {
        setCurrentProjectIndex(index);
        if (projects[index].user_access === 'editor') {
            setDefaultRoleValue('viewer');
            setShareRoleValue('viewer');
        } else {
            setDefaultRoleValue('owner');
            setShareRoleValue('owner');
        }
        setShowShareModal(true);
    };
    const handleManageDataModalClose = () => setShowManageDataModal(false);
    const handleManageDataModalShow = (index) => {
        setCurrentProjectIndex(index);
        setShowManageDataModal(true);
    };

    // Set current script in App with prop function
    // Then push scripts component Route - 'opens' the project
    function openProject(e, index) {
        setSelectedProjectIndex(index);
        history.push(`/scripts/${projects[index].name}`);
    }

    // Create a new project
    function createProject() {
        // Name of newly created project to send in POST
        let newProjectName = { name: createModalFormValue };

        fetch(`http://localhost:8080/API/create_project/${token.unityid}`, {
            method: 'POST',
            body: JSON.stringify(newProjectName),
        })
            .then((response) => response.json())
            .then((data) => {
                // Create new project object to add to script list
                let newProject = {
                    id: data.id,
                    name: newProjectName.name,
                    user_access: 'owner',
                    project_access: {
                        owner: token.unityid,
                        editors: [],
                        viewers: [],
                    },
                    scripts: [],
                };
                // Create copy of project list using concat to add new project to the end
                // Set the projects to the new updated list
                // Show error alert if error is caught when fetch fails
                const newProjectList = projects.concat(newProject);
                setProjects(newProjectList);

                // Reset modal form value
                setCreateModalFormValue('');

                console.log('Create Project Success: ', newProject);
            })
            .catch((error) => {
                setAlertText('Error: Could not create project');
                setAlertVariant('danger');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
                console.error('Create Project Error: ', error);
            });

        // Close create project modal
        handleCreateModalClose();
    }

    // Delete project only if deletion from server is successful
    function deleteProject(index) {
        fetch(
            `http://localhost:8080/API/delete_project/${token.unityid}/${projects[index].id}`,
            {
                method: 'DELETE',
            }
        )
            .then((response) => response.json())
            .then(() => {
                // Create copy of projects, remove project, set projects
                let newProjects = [...projects];
                newProjects.splice(index, 1);
                setProjects(newProjects);

                // Set current project to 0 to avoid index errors after deletion
                setCurrentProjectIndex(0);

                console.log('Delete Successful');
            })
            .catch((error) => {
                setAlertText('Error: Could not delete project');
                setAlertVariant('danger');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
                console.log('Delete Error: ', error);
            });
    }

    // Accepts active project index and renames it
    function renameProject(index) {
        // New name to send in post request
        let newName = { name: renameModalFormValue };

        fetch(
            `http://localhost:8080/API/save_project/${token.unityid}/${projects[index].id}`,
            {
                method: 'POST',
                body: JSON.stringify(newName),
            }
        )
            .then((response) => response.json())
            .then(() => {
                setCurrentProjectIndex(index);
                let tempProjects = [...projects];
                let tempProject = {
                    ...tempProjects[currentProjectIndex],
                    name: renameModalFormValue,
                };
                tempProjects[currentProjectIndex] = tempProject;
                setProjects(tempProjects);

                // Reset modal form value
                setRenameModalFormValue('');

                console.log('Rename Successful');
            })
            .catch((error) => {
                setAlertText('Error: Could not rename project');
                setAlertVariant('danger');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
                console.log('Rename Error: ', error);
            });

        // Close rename modal
        handleRenameModalClose();
    }

    // Share project with entered user at specified role
    function shareProject(index) {
        // New user and access role to send in post request
        let userAccess = {
            user: shareModalFormValue,
            access_level: shareRoleValue,
        };

        fetch(
            `http://localhost:8080/API/update_access/${token.unityid}/${projects[index].id}`,
            {
                method: 'POST',
                body: JSON.stringify(userAccess),
            }
        )
            .then((response) => response)
            .then(() => {
                let tempProjects = [...projects];
                let tempProject = { ...tempProjects[currentProjectIndex] };
                switch (shareRoleValue) {
                    case 'owner':
                        let tempOwner = tempProject.project_access.owner;
                        tempProject.project_access.owner = shareModalFormValue;
                        tempProject.project_access.editors.push(tempOwner);
                        tempProject.user_access = 'editor';
                        break;
                    case 'editor':
                        tempProject.project_access.editors.push(
                            shareModalFormValue
                        );
                        break;
                    case 'viewer':
                        tempProject.project_access.viewers.push(
                            shareModalFormValue
                        );
                        break;
                    default:
                        break;
                }
                tempProjects[currentProjectIndex] = tempProject;
                setProjects(tempProjects);

                // clear id form value
                setShareModalFormValue('');

                console.log('Share Project Success');
            })
            .catch((error) => {
                setAlertText('Error: Could not share project');
                setAlertVariant('danger');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
                console.log('Share Project Error: ', error);
            });

        // close the share modal
        handleShareModalClose();
    }

    // Stop sharing the project with the entered user
    function stopSharing(currentIndex) {
        // user to remove to send in post request
        let removedUser = { user: removeUserModalFormValue };

        fetch(
            `http://localhost:8080/API/remove_access/${token.unityid}/${projects[currentIndex].id}`,
            {
                method: 'POST',
                body: JSON.stringify(removedUser),
            }
        )
            .then((response) => response)
            .then(() => {
                let tempProjects = [...projects];
                let tempProject = tempProjects[currentIndex];
                let index = tempProject.project_access.editors.indexOf(
                    removedUser.user
                );
                if (index >= 0)
                    tempProject.project_access.editors.splice(index, 1);
                index = tempProject.project_access.viewers.indexOf(
                    removedUser.user
                );
                if (index >= 0)
                    tempProject.project_access.viewers.splice(index, 1);

                tempProjects[currentIndex] = tempProject;
                setProjects(tempProjects);

                // clear id form value
                setShareModalFormValue('');

                console.log('Remove user from project success');
            })
            .catch((error) => {
                setAlertText('Error: Could not remove user from project');
                setAlertVariant('danger');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
                console.log('Remove user from project error: ', error);
            });

        // close the share modal
        handleRemoveUserModalClose();
    }

    // Submit cron string used to manage data lifetime for a project
    function submitDataLifetimeString(index) {
        // user to remove to send in post request
        let lifetimeString = { lifetime: dataLifetimeString };

        fetch(
            `http://localhost:8080/API/set_data_lifetime/${token.unityid}/${projects[currentProjectIndex].id}`,
            {
                method: 'POST',
                body: JSON.stringify(lifetimeString),
            }
        )
            .then((response) => response)
            .then(() => {
                // clear id form value
                setDataLifetimeString('');
                setAlertText('Submitted data lifetime string');
                setAlertVariant('success');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
                console.log('Successfully submitted data lifetime string');
            })
            .catch((error) => {
                setAlertText('Error: Could not submit data lifetime string');
                setAlertVariant('danger');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
                console.log('Error submitting data lifetime string: ', error);
            });

        // close the data lifetime modal
        handleManageDataModalClose();
    }

    // Remove the user from the project they wish to leave
    function leaveProject(index) {
        // Remove the user of the application from this project
        let removedUser = { user: token.unityid };
        fetch(
            `http://localhost:8080/API/remove_access/${token.unityid}/${projects[index].id}`,
            {
                method: 'POST',
                body: JSON.stringify(removedUser),
            }
        )
            .then((response) => response)
            .then(() => {
                // Remove current project from user's list if they successfully leave
                let newProjects = [...projects];
                newProjects.splice(index, 1);
                setProjects(newProjects);

                setAlertText(
                    `Successfully left ${
                        projects[index].name ? projects[index].name : 'Project'
                    }`
                );
                setAlertVariant('success');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);

                console.log('Successfully left project');
            })
            .catch((error) => {
                setAlertText('Error: Could not leave the project');
                setShowAlert(true);
                window.setTimeout(() => {
                    setShowAlert(false);
                }, 5000);
                console.log('Error leaving project: ', error);
            });

        // Set current project to 0 to avoid index errors after deletion
        setCurrentProjectIndex(0);
    }

    // Set projects and modals container according to projects' status
    // If there are no projects, prompt user to create one, do not render
    let projectsContainer;
    let modalsContainer;
    if (!projects.length || projects === undefined) {
        projectsContainer = (
            <div className='no-projects-container'>
                <p>Create a project to begin</p>
            </div>
        );
        modalsContainer = null;
    } else {
        projectsContainer = (
            <div className='projects-container'>
                {projects.map((project, i) => {
                    return (
                        <Card className='project-card' key={i}>
                            <Card.Header as='h5'>{project.name}</Card.Header>
                            <Card.Body className='card-body'>
                                <Card.Title className='scripts-list-title'>
                                    {project.scripts.length === 1
                                        ? '1 Script'
                                        : `${project.scripts.length} Scripts`}
                                </Card.Title>
                                <Card.Text className='card-text access'>
                                    <strong>Owner:</strong>{' '}
                                    {project.project_access.owner}
                                </Card.Text>
                                <Card.Text className='card-text access'>
                                    <strong>Editors:</strong>{' '}
                                    {project.project_access.editors
                                        ? project.project_access.editors.join(
                                              ', '
                                          )
                                        : ''}
                                </Card.Text>
                                <Card.Text className='card-text access'>
                                    <strong>Viewers:</strong>{' '}
                                    {project.project_access.viewers
                                        ? project.project_access.viewers.join(
                                              ', '
                                          )
                                        : ''}
                                </Card.Text>
                                <div className='card-buttons-container'>
                                    <Button
                                        variant='primary'
                                        className='open-project-button'
                                        onClick={(e) => openProject(e, i)}
                                    >
                                        Open Project
                                    </Button>
                                    <DropdownButton
                                        variant='outline-primary'
                                        className='actions-button'
                                        title={
                                            <IconContext.Provider
                                                value={{
                                                    style: {
                                                        fontSize: '1.5em',
                                                    },
                                                }}
                                            >
                                                <FiSettings />
                                            </IconContext.Provider>
                                        }
                                    >
                                        <Dropdown.Item
                                            as='button'
                                            onClick={(e) =>
                                                handleManageDataModalShow(i)
                                            }
                                            disabled={
                                                project.user_access === 'viewer'
                                            }
                                        >
                                            Manage Data Lifetime
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            as='button'
                                            onClick={(e) =>
                                                handleShareModalShow(i)
                                            }
                                            disabled={
                                                project.user_access === 'viewer'
                                            }
                                        >
                                            Share Project
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            as='button'
                                            onClick={(e) =>
                                                handleRemoveUserModalShow(i)
                                            }
                                            disabled={
                                                project.user_access === 'viewer'
                                            }
                                        >
                                            Remove User
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            as='button'
                                            onClick={(e) =>
                                                handleRenameModalShow(i)
                                            }
                                            disabled={
                                                project.user_access === 'viewer'
                                            }
                                        >
                                            Rename Project
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item
                                            as='button'
                                            onClick={(e) => leaveProject(i)}
                                            disabled={
                                                project.user_access === 'owner'
                                            }
                                        >
                                            Leave Project
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            as='button'
                                            onClick={(e) => deleteProject(i)}
                                            disabled={
                                                project.user_access ===
                                                    'editor' ||
                                                project.user_access === 'viewer'
                                            }
                                        >
                                            Delete Project
                                        </Dropdown.Item>
                                    </DropdownButton>
                                </div>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        );

        modalsContainer = (
            <div>
                <Modal
                    show={showRenameProjectModal}
                    onHide={handleRenameModalClose}
                    animation={true}
                    centered
                >
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId='renameProjectName'>
                                <Form.Label>
                                    Rename{' '}
                                    <strong>
                                        {projects.length === 0
                                            ? ''
                                            : projects[currentProjectIndex]
                                                  .name}
                                    </strong>{' '}
                                    to
                                </Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter new project name'
                                    onChange={(e) =>
                                        setRenameModalFormValue(e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant='secondary'
                            onClick={handleRenameModalClose}
                        >
                            Close
                        </Button>
                        <Button
                            type='submit'
                            variant='primary'
                            onClick={(e) => renameProject(currentProjectIndex)}
                        >
                            Rename Project
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={showShareModal}
                    onHide={handleShareModalClose}
                    animation={true}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Share{' '}
                            {projects.length === 0
                                ? 'Project'
                                : projects[currentProjectIndex].name}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='share-body'>
                        <Form className='share-id-form'>
                            <Form.Group controlId='renameProjectName'>
                                <Form.Label>Share project with</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='UnityID'
                                    onChange={(e) =>
                                        setShareModalFormValue(e.target.value)
                                    }
                                />
                            </Form.Group>
                        </Form>
                        <Form className='role-form'>
                            <Form.Label>Role</Form.Label>
                            <Form.Control
                                as='select'
                                custom
                                onChange={(e) =>
                                    setShareRoleValue(e.target.value)
                                }
                                defaultValue={defaultRoleValue}
                                data-testid='role-input'
                            >
                                <option
                                    hidden={
                                        projects[currentProjectIndex]
                                            ? projects[currentProjectIndex]
                                                  .user_access !== 'owner'
                                            : true
                                    }
                                    value='owner'
                                >
                                    Owner
                                </option>
                                <option
                                    hidden={
                                        projects[currentProjectIndex]
                                            ? projects[currentProjectIndex]
                                                  .user_access !== 'owner'
                                            : true
                                    }
                                    value='editor'
                                >
                                    Editor
                                </option>
                                <option value='viewer'>Viewer</option>
                            </Form.Control>
                        </Form>
                    </Modal.Body>
                    <Modal.Body className='access-list'>
                        <div>
                            <strong>Owner:</strong>{' '}
                            {projects[currentProjectIndex].project_access.owner
                                ? projects[currentProjectIndex].project_access
                                      .owner
                                : ''}
                        </div>
                        <div>
                            <strong>Editors:</strong>{' '}
                            {projects[currentProjectIndex].project_access
                                .editors
                                ? projects[
                                      currentProjectIndex
                                  ].project_access.editors.join(', ')
                                : ''}
                        </div>
                        <div>
                            <strong>Viewers:</strong>{' '}
                            {projects[currentProjectIndex].project_access
                                .viewers
                                ? projects[
                                      currentProjectIndex
                                  ].project_access.viewers.join(', ')
                                : ''}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            className='share-right-button'
                            variant='secondary'
                            onClick={handleShareModalClose}
                        >
                            Close
                        </Button>
                        <Button
                            className='share-right-button'
                            type='submit'
                            variant='primary'
                            onClick={(e) => shareProject(currentProjectIndex)}
                        >
                            Share Project
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={showRemoveUserModal}
                    onHide={handleRemoveUserModalClose}
                    animation={true}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Remove User from{' '}
                            {projects.length === 0
                                ? 'Project'
                                : projects[currentProjectIndex].name}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Label>User</Form.Label>
                        <Form.Control
                            as='select'
                            custom
                            onChange={(e) =>
                                setRemoveUserModalFormValue(e.target.value)
                            }
                            defaultValue='Select User'
                        >
                            <option>Select User</option>
                            {projects[currentProjectIndex] &&
                                projects[currentProjectIndex].user_access ===
                                    'owner' &&
                                projects[
                                    currentProjectIndex
                                ].project_access.editors.map((item, i) => {
                                    return (
                                        <option value={item} key={i}>
                                            {item}
                                        </option>
                                    );
                                })}
                            {projects[currentProjectIndex] &&
                                projects[
                                    currentProjectIndex
                                ].project_access.viewers.map((item, i) => {
                                    return (
                                        <option value={item} key={i}>
                                            {item}
                                        </option>
                                    );
                                })}
                        </Form.Control>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant='secondary'
                            onClick={handleRemoveUserModalClose}
                        >
                            Close
                        </Button>
                        <Button
                            type='submit'
                            variant='primary'
                            onClick={(e) => stopSharing(currentProjectIndex)}
                        >
                            Remove User
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={showManageDataModal}
                    onHide={handleManageDataModalClose}
                    animation={true}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Set Data Lifetime of{' '}
                            {projects.length === 0
                                ? 'Project'
                                : projects[currentProjectIndex].name}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control
                            type='text'
                            placeholder='0-59 0-23 1-31 1-12 0-7'
                            onChange={(e) =>
                                setDataLifetimeString(e.target.value)
                            }
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant='secondary'
                            onClick={handleManageDataModalClose}
                        >
                            Close
                        </Button>
                        <Button
                            type='submit'
                            variant='primary'
                            onClick={(e) =>
                                submitDataLifetimeString(currentProjectIndex)
                            }
                        >
                            Submit
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }

    return (
        <div className='projects-page'>
            <div className='projects-header'>
                <h2>Projects</h2>
                <div className='alert-and-button-container'>
                    <Alert
                        className='create-project-alert'
                        show={showAlert}
                        variant={alertVariant}
                    >
                        {alertText}
                    </Alert>
                    <div className='create-project-container'>
                        <Button
                            variant='success'
                            onClick={handleCreateModalShow}
                        >
                            {`Create Project `}
                            <IconContext.Provider
                                value={{
                                    style: {
                                        fontSize: '1.5em',
                                    },
                                }}
                            >
                                <GoPlusSmall />
                            </IconContext.Provider>
                        </Button>
                    </div>
                </div>
            </div>

            {projectsContainer}

            <Modal
                show={showCreateProjectModal}
                onHide={handleCreateModalClose}
                animation={true}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Create New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId='newProjectName'>
                            <Form.Label>Project Name</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter new project name'
                                onChange={(e) =>
                                    setCreateModalFormValue(e.target.value)
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='secondary'
                        onClick={handleCreateModalClose}
                    >
                        Close
                    </Button>
                    <Button
                        type='submit'
                        variant='primary'
                        onClick={createProject}
                    >
                        Create Project
                    </Button>
                </Modal.Footer>
            </Modal>

            {modalsContainer}
        </div>
    );
}

export default Projects;
