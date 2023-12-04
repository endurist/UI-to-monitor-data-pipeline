import React from 'react';
import './Home.css';
import { useHistory } from 'react-router-dom';

const Home = () => {
    let history = useHistory();

    function handleProjectClick() {
        history.push('/projects');
    }

    function handleDataClick() {
        history.push('/data');
    }

    return (
        <div className='home'>
            <div className='title'>
                <h1>Data Pipeline Monitoring System</h1>
            </div>
            <div className='body'>
                <p>
                    Data pipelines efficiently handle the transportation of raw
                    data, but as data grows large in size, it becomes
                    increasingly difficult to manage. Can a user-friendly UI be
                    developed to enable pipeline owners to centrally manage and
                    monitor data quality information? This application provides
                    an interface for users to create their own python scripts in
                    order to inspect data quality.
                </p>
            </div>
            <div className='buttons'>
                <button className='home-button' onClick={handleProjectClick}>
                    View Projects
                </button>
                <button className='home-button' onClick={handleDataClick}>
                    View Data
                </button>
            </div>
        </div>
    );
};

export default Home;
