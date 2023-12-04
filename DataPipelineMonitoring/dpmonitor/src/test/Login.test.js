import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { shallow } from 'enzyme';

import Login from '../components/Login';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

afterEach(cleanup);

const mockSetToken = jest.fn();

it('renders', () => {
    shallow(<Login setToken={mockSetToken} />);
});

it('should take a snapshot', () => {
    const { asFragment } = render(<Login setToken={mockSetToken} />);

    expect(asFragment(<Login setToken={mockSetToken} />)).toMatchSnapshot();
});

it('should render one Form', () => {
    const wrapper = shallow(<Login setToken={mockSetToken} />);
    expect(wrapper.find(Form)).toHaveLength(1);
});

it('should render one Form.Label', () => {
    const wrapper = shallow(<Login setToken={mockSetToken} />);
    expect(wrapper.find(Form.Label)).toHaveLength(1);
});

it('should render one Form.Control', () => {
    const wrapper = shallow(<Login setToken={mockSetToken} />);
    expect(wrapper.find(Form.Control)).toHaveLength(1);
});

it('should render one Button', () => {
    const wrapper = shallow(<Login setToken={mockSetToken} />);
    expect(wrapper.find(Button)).toHaveLength(1);
});

it('should say UnityID on the page', () => {
    const { getByText } = render(<Login setToken={mockSetToken} />);
    expect(getByText('UnityID')).toBeInTheDocument();
});
