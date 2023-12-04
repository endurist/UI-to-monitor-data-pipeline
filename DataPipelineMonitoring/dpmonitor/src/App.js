import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Scripts from './components/Scripts';
import Projects from './components/Projects';
import Data from './components/Data';
import Charts from './components/Charts';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import useToken from './useToken';

function App() {
    // The token used for authentication within Login component
    const [token, setToken] = useState();

    // State for all of the projects used in children components
    const [projects, setProjects] = useState([]);

    // State for current project for Scripts editing view
    const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);

    // Keeps track of whether scripts have been fetched or not
    const [projectsHaveBeenFetched, setProjectsHaveBeenFetched] = useState();

    // Pass the setToken function to the Login component
    if (!token) {
        return <Login setToken={setToken} />;
    } else {
        if (!projectsHaveBeenFetched) {
            // Scripts have been fetched, only want to do it once so we set flag to true
            setProjectsHaveBeenFetched(true);

            // Fetch the project list if it has not already been fetched
            // and set the projects as well as the fetched flag
            fetch(`http://localhost:8080/API/get_project_list/${token.unityid}`)
                .then((response) => response.json())
                .then((data) => {
                    // Set projects to the received data
                    setProjects(data);
                    console.log('Fetch Project List Success: ', data);
                })
                .catch((error) => {
                    console.log('Fetch Project List Error: ', error);
                });
        }
    }

    // Updates projects with changes from script editor changes
    function updateProjects(newScriptList) {
        let newProjects = [...projects];
        let newProject = {
            ...newProjects[selectedProjectIndex],
            scripts: newScriptList,
        };
        newProjects[selectedProjectIndex] = newProject;
        setProjects(newProjects);
    }

    return (
        <Router>
            <main>
                <header>
                    <Navbar
                        collapseOnSelect
                        expand='lg'
                        bg='light'
                        className='header-container'
                    >
                        <Navbar.Brand className='brand-container'>
                            <a
                                href='//www.ncsu.edu/'
                                rel='noreferrer'
                                target='_blank'
                            >
                                <img
                                    src='https://ncsu-las.org/wp-content/themes/awi/img/logo-ncsu.png'
                                    srcSet='https://ncsu-las.org/wp-content/themes/awi/img/logo-ncsu.png 1x, https://ncsu-las.org/wp-content/themes/awi/img/logo-ncsu@2x.png 2x'
                                    target='_blank'
                                    className='logo'
                                    alt='NC State University'
                                    title='NC State University'
                                    width='105'
                                    height='50'
                                />
                            </a>
                            <a
                                href='https://ncsu-las.org'
                                rel='noreferrer'
                                target='_blank'
                            >
                                <img
                                    src='https://ncsu-las.org/wp-content/themes/awi/img/logo-las.png'
                                    srcSet='https://ncsu-las.org/wp-content/themes/awi/img/logo-las.png 1x, https://ncsu-las.org/wp-content/themes/awi/img/logo-las@2x.png 2x'
                                    target='_blank'
                                    className='logo'
                                    alt='Laboratory for Analytic Sciences'
                                    title='Laboratory for Analytic Sciences'
                                    width='215'
                                    height='50'
                                />
                            </a>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls='basic-navbar-nav' />
                        <Navbar.Collapse
                            className='menu-item-container'
                            id='basic-navbar-nav'
                        >
                            <Nav className='ml-auto menu-item-container header-collapse'>
                                <Nav.Link
                                    as={Link}
                                    to='/'
                                    className='menu-item'
                                    eventKey='1'
                                >
                                    Home
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to='/projects'
                                    className='menu-item'
                                    eventKey='2'
                                >
                                    Projects
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to='/data'
                                    className='menu-item'
                                    eventKey='3'
                                >
                                    Data
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to='/charts'
                                    className='menu-item'
                                    eventKey='4'
                                >
                                    Charts
                                </Nav.Link>
                                <div className='username'>{token.unityid}</div>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>
                </header>
                <Switch>
                    <Route path='/' exact component={Home} />
                    <Route
                        path='/projects'
                        render={(props) => (
                            <Projects
                                {...props}
                                token={token}
                                projects={projects}
                                setSelectedProjectIndex={
                                    setSelectedProjectIndex
                                }
                                setProjects={setProjects}
                            />
                        )}
                    />
                    <Route
                        path='/scripts/:projectName'
                        render={(props) => (
                            <Scripts
                                {...props}
                                token={token}
                                project={projects[selectedProjectIndex]}
                                updateProjects={updateProjects}
                            />
                        )}
                    />
                    <Route
                        path='/data'
                        render={(props) => (
                            <Data
                                {...props}
                                token={token}
                                projects={projects}
                            />
                        )}
                    />
                    <Route
                        path='/charts'
                        render={(props) => (
                            <Charts
                                {...props}
                                token={token}
                                projects={projects}
                                scripts={
                                    projects[selectedProjectIndex]
                                        ? projects[selectedProjectIndex].scripts
                                        : []
                                }
                            />
                        )}
                    />
                </Switch>
            </main>
        </Router>
    );
}

export default App;
