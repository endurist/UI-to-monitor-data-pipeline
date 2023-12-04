import React, { Component } from 'react';
import Editor from './Editor';
import ScriptList from './ScriptList';
import Scheduler from './Scheduler';
import './Scripts.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { AiFillCopy } from 'react-icons/ai';
import { IconContext } from 'react-icons/lib';
import ReactTooltip from 'react-tooltip';
import { withRouter } from 'react-router-dom';

class Scripts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedScriptIndex: 0,
            showCreateModal: false,
            showSchedulerModal: false,
            showAlert: false,
            alertText: '',
            alertVariant: '',
            createFormValue: '',
            renameFormValue: '',
            showRename: false,
            copyStatus: 'Copy',
            theme: 'solarized_dark',
            saveStatus: 'Saved!',
            showSaveStatus: false,
        };
        this.handleClick = this.handleClick.bind(this);
        this.renderEditor = this.renderEditor.bind(this);
        this.handleCreateModalClose = this.handleCreateModalClose.bind(this);
        this.handleCreateModalShow = this.handleCreateModalShow.bind(this);
        this.handleSchedulerModalClose = this.handleSchedulerModalClose.bind(
            this
        );
        this.handleSchedulerModalShow = this.handleSchedulerModalShow.bind(
            this
        );
        this.createScript = this.createScript.bind(this);
        this.deleteScript = this.deleteScript.bind(this);
        this.handleCopyURL = this.handleCopyURL.bind(this);
        this.updateCopyStatus = this.updateCopyStatus.bind(this);
        this.updateEditorValue = this.updateEditorValue.bind(this);
        this.saveScript = this.saveScript.bind(this);
        this.handleCronSchedule = this.handleCronSchedule.bind(this);
        this.renameScript = this.renameScript.bind(this);
        this.handleRenameShow = this.handleRenameShow.bind(this);
        this.handleRenameClose = this.handleRenameClose.bind(this);
        this.showSaveOverlay = this.showSaveOverlay.bind(this);
    }

    // Functions for showing and closing modals
    handleCreateModalClose = () => this.setState({ showCreateModal: false });
    handleCreateModalShow = () => this.setState({ showCreateModal: true });
    handleSchedulerModalClose = () =>
        this.setState({ showSchedulerModal: false });
    handleSchedulerModalShow = () =>
        this.setState({ showSchedulerModal: true });
    handleRenameShow = () => this.setState({ showRename: true });
    handleRenameClose = () => this.setState({ showRename: false });

    // Changes the copy button tooltip back to copy
    updateCopyStatus = () => this.setState({ copyStatus: 'Copy' });

    showSaveOverlay = () => {
        this.setState({ showSaveStatus: true }, () => {
            window.setTimeout(() => {
                this.setState({ showSaveStatus: false });
            }, 4000);
        });
    };

    // Sends the cron string for a certain script for scheduling
    handleCronSchedule(e, cronString) {
        e.preventDefault();
        let schedulingData = { schedule: cronString };

        fetch(
            `http://localhost:8080/API/schedule_script/${
                this.props.project.scripts[this.state.selectedScriptIndex].id
            }`,
            {
                method: 'POST',
                body: JSON.stringify(schedulingData),
            }
        )
            .then((response) => response)
            .then(() => {
                this.setState(
                    {
                        alertText: `${
                            this.props.project.scripts[
                                this.state.selectedScriptIndex
                            ].name
                        } scheduled successfully`,
                        alertVariant: 'success',
                        showAlert: true,
                    },
                    () => {
                        window.setTimeout(() => {
                            this.setState({ showAlert: false });
                        }, 5000);
                    }
                );
                console.log('Schedule Success');
            })
            .catch((error) => {
                this.setState(
                    {
                        alertText: `Error: ${
                            this.props.project.scripts[
                                this.state.selectedScriptIndex
                            ].name
                        } not scheduled`,
                        alertVariant: 'danger',
                        showAlert: true,
                    },
                    () => {
                        window.setTimeout(() => {
                            this.setState({ showAlert: false });
                        }, 5000);
                    }
                );
                console.log('Schedule Error: ', error);
            });

        this.handleSchedulerModalClose();
    }

    // Updates the selected index to the appropriate script in the list
    handleClick(e) {
        let nodes = Array.prototype.slice.call(e.currentTarget.children);
        let index = nodes.indexOf(e.target);
        this.setState({ selectedScriptIndex: index });
    }

    // Saves a single script to the backend
    saveScript() {
        let data = {
            script_text: this.props.project.scripts[
                this.state.selectedScriptIndex
            ].scriptText,
            name: this.props.project.scripts[this.state.selectedScriptIndex]
                .name,
        };
        fetch(
            `http://localhost:8080/API/save_script/${
                this.props.project.scripts[this.state.selectedScriptIndex].id
            }`,
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        )
            .then((response) => response.json())
            .then(() => {
                this.setState({ saveStatus: 'Saved!' });
                console.log('Save Success');
                this.showSaveOverlay();
            })
            .catch((error) => {
                this.setState({ saveStatus: 'Error: Not Saved' });
                console.log('Save Error: ', error);
                this.showSaveOverlay();
            });
    }

    // Render the editor with the appropriate value and props
    // If there are no scripts created, the editor is readonly
    renderEditor(selectedScript) {
        if (this.props.project.scripts.length === 0) {
            return (
                <Editor
                    className='editor'
                    editorValue=''
                    updateEditorValue={this.updateEditorValue}
                    readOnly={true}
                    theme={this.state.theme}
                />
            );
        } else {
            return (
                <Editor
                    className='editor'
                    editorValue={selectedScript.scriptText}
                    updateEditorValue={this.updateEditorValue}
                    readOnly={this.props.project.user_access === 'viewer'}
                    theme={this.state.theme}
                />
            );
        }
    }

    // Updates the value of a project's script every time the editor is changed
    // Results in automatic saving of all scripts
    updateEditorValue(newValue) {
        let scripts = [...this.props.project.scripts];
        let script = {
            ...scripts[this.state.selectedScriptIndex],
            scriptText: newValue,
        };
        scripts[this.state.selectedScriptIndex] = script;
        this.props.updateProjects(scripts);
    }

    // Copies the endpoint URL for a script to the clipboard
    handleCopyURL() {
        this.setState({ copyStatus: 'Copied!' });
        navigator.clipboard.writeText(
            `/API/receive_data/${this.props.project.id}`
        );
    }

    // Runs after user submits form for creating new script and entering
    // script name.
    // Here we should call the create script api endpoint to send
    // script name and get the new script id as well as the post url
    createScript(e) {
        // The data to send in the post request
        const scriptName = { name: this.state.createFormValue };

        // POST to create new script, sending user's script name
        // and receiving the new unique id
        fetch(
            `http://localhost:8080/API/create_script/${this.props.token.unityid}/${this.props.project.id}`,
            {
                method: 'POST',
                body: JSON.stringify(scriptName),
            }
        )
            .then((response) => response.json())
            .then((data) => {
                // Create new script object to add to script list
                let newScript = {
                    id: data.script_id,
                    name: this.state.createFormValue,
                    scriptText: '',
                };
                // Create copy of script list using concat
                // to add new script to the end
                // Set the scripts state to the new list
                // Select the newly created script
                // Show error alert if error is caught when fetch fails
                const newScriptList = this.props.project.scripts.concat(
                    newScript
                );
                this.props.updateProjects(newScriptList);
                this.setState({
                    selectedScriptIndex: this.props.project.scripts.length - 1,
                });

                // Reset modal form value
                this.setState({ createFormValue: '' });

                console.log('Create Script Success: ', newScript);
            })
            .catch((error) => {
                console.error('Create Script Error: ', error);
                this.setState(
                    {
                        alertText: 'Error: Could not create the script',
                        alertVariant: 'danger',
                        showAlert: true,
                    },
                    () => {
                        window.setTimeout(() => {
                            this.setState({ showAlert: false });
                        }, 5000);
                    }
                );
            });

        // Close modal
        this.handleCreateModalClose();
    }

    // Delete script from frontend only if successful removal from backend
    deleteScript() {
        fetch(
            `http://localhost:8080/API/delete_script/${
                this.props.project.scripts[this.state.selectedScriptIndex].id
            }`,
            {
                method: 'DELETE',
            }
        )
            .then((response) => response.json())
            .then(() => {
                // Delete script from state only if deletion from server is successful
                let index = this.state.selectedScriptIndex;

                // If deleting the last script in the list,
                // Update the selected script to the one above
                if (
                    index === this.props.project.scripts.length - 1 &&
                    this.props.project.scripts.length !== 1
                ) {
                    this.setState({ selectedScriptIndex: index - 1 });
                }

                // Create copy of scripts state, remove script, set state
                let scripts = [...this.props.project.scripts];
                scripts.splice(index, 1);
                this.props.updateProjects(scripts);

                console.log('Delete Successful');
            })
            .catch((error) => {
                console.log('Delete Error: ', error);
                this.setState(
                    {
                        alertText: 'Error: Could not delete the script',
                        alertVariant: 'danger',
                        showAlert: true,
                    },
                    () => {
                        window.setTimeout(() => {
                            this.setState({ showAlert: false });
                        }, 5000);
                    }
                );
            });
    }

    // Rename script through save script endpoint
    renameScript() {
        let scriptData = {
            script_text: this.props.project.scripts[
                this.state.selectedScriptIndex
            ].scriptText,
            name: this.state.renameFormValue,
        };
        fetch(
            `http://localhost:8080/API/save_script/${
                this.props.project.scripts[this.state.selectedScriptIndex].id
            }`,
            {
                method: 'POST',
                body: JSON.stringify(scriptData),
            }
        )
            .then((response) => response.json())
            .then(() => {
                let scripts = [...this.props.project.scripts];
                let script = {
                    ...scripts[this.state.selectedScriptIndex],
                    name: this.state.renameFormValue,
                };
                scripts[this.state.selectedScriptIndex] = script;
                this.props.updateProjects(scripts);

                // Reset the rename form value
                this.setState({ renameFormValue: '' });

                console.log('Rename Success');
            })
            .catch((error) => {
                console.log('Rename Error: ', error);
                this.setState(
                    {
                        alertText: 'Error: Could not rename the script',
                        alertVariant: 'danger',
                        showAlert: true,
                    },
                    () => {
                        window.setTimeout(() => {
                            this.setState({ showAlert: false });
                        }, 5000);
                    }
                );
            });

        // Close the rename modal
        this.handleRenameClose();
    }

    render() {
        // If there are no projects, scripts url redirects to projects
        if (!this.props.project) {
            const { history } = this.props;
            history.push('/projects');
            return null;
        } else {
            return (
                <div className='scripts-page-container'>
                    <div className='editor-section'>
                        <div className='scripts-page-headings'>
                            <h4 className='project-name'>
                                {this.props.project.name}
                            </h4>
                            <div className='post-url-section'>
                                <Form.Label className='url-label'>
                                    POST url:
                                </Form.Label>
                                <Form.Control
                                    className='url'
                                    id='urlFormControl'
                                    type='text'
                                    value={`/API/receive_data/${this.props.project.id}`}
                                    readOnly
                                />

                                <button
                                    className='copy-button'
                                    onClick={this.handleCopyURL}
                                    data-for='copy-tooltip'
                                    data-tip
                                >
                                    <IconContext.Provider
                                        value={{
                                            style: {
                                                fontSize: '1.5em',
                                                color: 'black',
                                            },
                                        }}
                                    >
                                        <AiFillCopy />
                                    </IconContext.Provider>
                                </button>
                                <ReactTooltip
                                    id='copy-tooltip'
                                    place='right'
                                    effect='solid'
                                    getContent={() => this.state.copyStatus}
                                    afterHide={this.updateCopyStatus}
                                />
                            </div>
                        </div>

                        {this.renderEditor(
                            this.props.project.scripts[
                                this.state.selectedScriptIndex
                            ]
                        )}

                        <div className='options-container'>
                            <Form className='theme-form' inline>
                                <Form.Group controlId='selectTheme'>
                                    <Form.Label className='theme-form-title'>
                                        Theme
                                    </Form.Label>
                                    <Form.Control
                                        as='select'
                                        custom
                                        onChange={(e) =>
                                            this.setState({
                                                theme: e.target.value,
                                            })
                                        }
                                        data-testid='theme-input'
                                    >
                                        <option
                                            value='solarized_dark'
                                            data-testid='solarized_dark'
                                        >
                                            Solarized Dark
                                        </option>
                                        <option value='solarized_light'>
                                            Solarized Light
                                        </option>
                                        <option value='monokai'>Monokai</option>
                                        <option
                                            value='tomorrow'
                                            data-testid='tomorrow'
                                        >
                                            Tomorrow
                                        </option>
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                            <div className='editor-buttons-container'>
                                <Button
                                    className='schedule-button'
                                    variant='outline-primary'
                                    disabled={
                                        this.props.project.scripts.length === 0
                                            ? true
                                            : this.props.project.scripts[
                                                  this.state.selectedScriptIndex
                                              ].scriptText === '' ||
                                              this.props.project.user_access ===
                                                  'viewer'
                                    }
                                    onClick={this.handleSchedulerModalShow}
                                >
                                    Schedule
                                </Button>

                                <OverlayTrigger
                                    trigger='click'
                                    placement='right'
                                    show={this.state.showSaveStatus}
                                    overlay={
                                        <Popover id='save-popover'>
                                            <Popover.Content>
                                                {this.state.saveStatus}
                                            </Popover.Content>
                                        </Popover>
                                    }
                                >
                                    <Button
                                        className='save-button'
                                        variant='outline-primary'
                                        onClick={this.saveScript}
                                        disabled={
                                            this.props.project.scripts
                                                .length === 0
                                                ? true
                                                : this.props.project.scripts[
                                                      this.state
                                                          .selectedScriptIndex
                                                  ].scriptText === '' ||
                                                  this.props.project
                                                      .user_access === 'viewer'
                                        }
                                    >
                                        Save Script
                                    </Button>
                                </OverlayTrigger>
                            </div>
                        </div>
                    </div>

                    <div className='script-section'>
                        <div className='scripts-page-headings'>
                            <h4>Scripts</h4>
                        </div>
                        <div className='list-and-buttons'>
                            <ScriptList
                                className='script-list'
                                onScriptSelect={this.handleClick}
                                scriptList={this.props.project.scripts}
                                activeIndex={this.state.selectedScriptIndex}
                            />
                            <div className='script-list-buttons'>
                                <Button
                                    className='script-list-button create'
                                    variant='outline-primary'
                                    onClick={this.handleCreateModalShow}
                                    disabled={
                                        this.props.project.user_access ===
                                        'viewer'
                                    }
                                >
                                    Create Script
                                </Button>
                                <OverlayTrigger
                                    trigger='click'
                                    placement='top'
                                    show={this.state.showRename}
                                    overlay={
                                        <Popover id='rename-popover'>
                                            <Popover.Title>
                                                Rename{' '}
                                                <strong>
                                                    {this.props.project.scripts
                                                        .length === 0
                                                        ? ''
                                                        : this.props.project
                                                              .scripts[
                                                              this.state
                                                                  .selectedScriptIndex
                                                          ].name}
                                                </strong>{' '}
                                                to
                                            </Popover.Title>
                                            <Popover.Content>
                                                <div className='rename-form-container'>
                                                    <Form.Control
                                                        className='rename-form'
                                                        type='text'
                                                        onChange={(e) =>
                                                            this.setState({
                                                                renameFormValue:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    ></Form.Control>
                                                    <Button
                                                        className='inline-rename-button'
                                                        variant='primary'
                                                        onClick={
                                                            this.renameScript
                                                        }
                                                    >
                                                        Rename
                                                    </Button>
                                                </div>
                                            </Popover.Content>
                                        </Popover>
                                    }
                                >
                                    <Button
                                        className='script-list-button rename'
                                        variant='outline-primary'
                                        onClick={
                                            this.state.showRename
                                                ? this.handleRenameClose
                                                : this.handleRenameShow
                                        }
                                        disabled={
                                            !this.props.project.scripts
                                                .length ||
                                            this.props.project.user_access ===
                                                'viewer'
                                        }
                                    >
                                        Rename
                                    </Button>
                                </OverlayTrigger>

                                <Button
                                    className='script-list-button delete'
                                    variant='outline-primary'
                                    onClick={this.deleteScript}
                                    disabled={
                                        !this.props.project.scripts.length ||
                                        this.props.project.user_access ===
                                            'viewer'
                                    }
                                >
                                    Delete
                                </Button>
                            </div>
                            <Alert
                                className='alert'
                                show={this.state.showAlert}
                                variant={this.state.alertVariant}
                            >
                                {this.state.alertText}
                            </Alert>
                        </div>
                    </div>

                    <Modal
                        show={this.state.showCreateModal}
                        onHide={this.handleCreateModalClose}
                        animation={true}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Create New Script</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form>
                                <Form.Group controlId='newScriptName'>
                                    <Form.Label>Script Name</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Enter new script name'
                                        onChange={(e) =>
                                            this.setState({
                                                createFormValue: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant='secondary'
                                onClick={this.handleCreateModalClose}
                            >
                                Close
                            </Button>
                            <Button
                                type='submit'
                                variant='primary'
                                onClick={this.createScript}
                            >
                                Create Script
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Scheduler
                        show={this.state.showSchedulerModal}
                        handleClose={this.handleSchedulerModalClose}
                        handleSave={this.handleCronSchedule}
                        scriptName={
                            this.props.project.scripts.length === 0
                                ? ''
                                : this.props.project.scripts[
                                      this.state.selectedScriptIndex
                                  ].name
                        }
                    />
                </div>
            );
        }
    }
}

export default withRouter(Scripts);
