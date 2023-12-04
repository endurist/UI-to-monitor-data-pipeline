import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { shallow } from 'enzyme';

import Scripts from '../components/Scripts';
import ScriptList from '../components/ScriptList';
import Editor from '../components/Editor';
import Scheduler from '../components/Scheduler';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

const token = { unityid: 'testid' };
const scripts = [
    { id: 0, name: 'script0', scriptText: 'example text 0' },
    { id: 1, name: 'script1', scriptText: 'example text 1' },
    { id: 2, name: 'script2', scriptText: 'example text 2' },
];

afterEach(cleanup);

it('renders', () => {
    shallow(<Scripts token={token} scripts={scripts} />);
});

it('should render one ScriptList', () => {
    const wrapper = shallow(<Scripts token={token} scripts={scripts} />);
    expect(wrapper.find(ScriptList)).toHaveLength(1);
});

it('should render one Editor', () => {
    const wrapper = shallow(<Scripts token={token} scripts={scripts} />);
    expect(wrapper.find(Editor)).toHaveLength(1);
});

it('should render five Buttons', () => {
    const wrapper = shallow(<Scripts token={token} scripts={scripts} />);
    expect(wrapper.find(Button)).toHaveLength(5);
});

it('should render one Scheduler', () => {
    const wrapper = shallow(<Scripts token={token} scripts={scripts} />);
    expect(wrapper.find(Scheduler)).toHaveLength(1);
});

it('should render one Modal', () => {
    const wrapper = shallow(<Scripts token={token} scripts={scripts} />);
    expect(wrapper.find(Modal)).toHaveLength(1);
});

it('should render two Form.Control', () => {
    // One for create script form and one for heading above the Editor
    const wrapper = shallow(<Scripts token={token} scripts={scripts} />);
    expect(wrapper.find(Form.Control)).toHaveLength(2);
});

it('should render two Form.Label', () => {
    // One for create script form and one for heading above the Editor
    const wrapper = shallow(<Scripts token={token} scripts={scripts} />);
    expect(wrapper.find(Form.Label)).toHaveLength(2);
});

it('should say "POST data to:" and "Scripts" on the page', () => {
    const { getByText } = render(<Scripts token={token} scripts={scripts} />);
    expect(getByText('POST data to:')).toBeInTheDocument();
    expect(getByText('Scripts')).toBeInTheDocument();
});

test('all scripts should be rendered with their names shown', () => {
    const { getByText } = render(<Scripts token={token} scripts={scripts} />);
    expect(getByText('script0')).toBeInTheDocument();
    expect(getByText('script1')).toBeInTheDocument();
    expect(getByText('script2')).toBeInTheDocument();
});

test('Editor should be read only if scripts is empty, and update if scripts becomes non empty', () => {
    let wrapper = shallow(<Scripts token={token} scripts={[]} />);
    expect(wrapper.find('.editor').at(0).props().readOnly).toEqual(true);

    wrapper = shallow(<Scripts token={token} scripts={scripts} />);
    expect(wrapper.find('.editor').at(0).props().readOnly).toEqual(false);
});
