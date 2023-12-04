import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import PropTypes from 'prop-types';
import './Login.css';

export default function Login({ setToken }) {
    const [unityid, setUnityid] = useState();

    // No authentication, LAS will implement their system later
    // Just set the token to the entered unity id
    const handleSubmit = (e) => {
        e.preventDefault();
        const token = { unityid };
        setToken(token);
    };

    return (
        <div>
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
                </Navbar>
            </header>
            <div className='Login'>
                <Form onSubmit={handleSubmit}>
                    <Form.Group
                        size='lg'
                        controlId='unityid'
                        placeholder='Enter unity id'
                    >
                        <Form.Label>UnityID</Form.Label>
                        <Form.Control
                            autoFocus
                            onChange={(e) => setUnityid(e.target.value)}
                        />
                    </Form.Group>

                    <div className='form-group'>
                        <div className='custom-control custom-checkbox'>
                            <input
                                type='checkbox'
                                className='custom-control-input'
                                id='customCheck1'
                            />
                            <label
                                className='custom-control-label'
                                htmlFor='customCheck1'
                            >
                                Remember me
                            </label>
                        </div>
                    </div>
                    <Button block size='lg' type='submit'>
                        Login
                    </Button>
                </Form>
            </div>
        </div>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired,
};
