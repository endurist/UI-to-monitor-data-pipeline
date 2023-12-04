import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { shallow } from 'enzyme';
import '@testing-library/jest-dom/extend-expect';

import Data from '../components/Data';
import ScriptList from '../components/ScriptList';
import Grid from '../components/Grid';
import Button from 'react-bootstrap/Button';

const scripts = [
    { id: 0, name: 'script0', scriptText: 'example text 0' },
    { id: 1, name: 'script1', scriptText: 'example text 1' },
    { id: 2, name: 'script2', scriptText: 'example text 2' },
];

afterEach(cleanup);

it('renders', () => {
    shallow(<Data scripts={scripts} />);
});

it('should render one Grid', () => {
    const wrapper = shallow(<Data scripts={scripts} />);
    expect(wrapper.find(Grid)).toHaveLength(1);
});

it('should render one ScriptList', () => {
    const wrapper = shallow(<Data scripts={scripts} />);
    expect(wrapper.find(ScriptList)).toHaveLength(1);
});

it('should render one Button', () => {
    const wrapper = shallow(<Data scripts={scripts} />);
    expect(wrapper.find(Button)).toHaveLength(1);
});

it('should display "Ingested Data" and "Scripts" in the document', () => {
    const { getByText } = render(<Data scripts={scripts} />);
    expect(getByText('Ingested Data')).toBeInTheDocument();
    expect(getByText('Scripts')).toBeInTheDocument();
});

it('should display "No Rows To Show" and "Create a script to begin" in the document if scripts array is empty', () => {
    const { getByText } = render(<Data scripts={[]} />);
    expect(getByText('No Rows To Show')).toBeInTheDocument();
    expect(getByText('Create a script to begin')).toBeInTheDocument();
});

it('should display the script names when rendered with scripts', () => {
    const { getByText } = render(<Data scripts={scripts} />);
    expect(getByText('script0')).toBeInTheDocument();
    expect(getByText('script1')).toBeInTheDocument();
    expect(getByText('script2')).toBeInTheDocument();
});

it('should not display create script prompt if script list is not empty', () => {
    const window = render(<Data scripts={scripts} />);
    const createScriptPrompt = window.queryByText('Create a script to begin');
    expect(createScriptPrompt).not.toBeInTheDocument();
});
