import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { shallow } from 'enzyme';

import ScriptList from '../components/ScriptList';
import ListGroup from 'react-bootstrap/ListGroup';

afterEach(cleanup);

const scripts = [
    { id: 0, name: 'script1', scriptText: 'hi' },
    { id: 1, name: 'script2', scriptText: 'hi2' },
];
const emptyScripts = [];

it('should take a snapshot', () => {
    const { asFragment } = render(
        <ScriptList scriptList={scripts} activeIndex={0} />
    );

    expect(asFragment(<ScriptList />)).toMatchSnapshot();
});

it('should render one ListGroup', () => {
    const wrapper = shallow(
        <ScriptList scriptList={scripts} activeIndex={0} />
    );
    expect(wrapper.find(ListGroup)).toHaveLength(1);
});

it('should render two ListGroup.Items', () => {
    const wrapper = shallow(
        <ScriptList scriptList={scripts} activeIndex={0} />
    );
    expect(wrapper.find(ListGroup.Item)).toHaveLength(2);
});

it('should render zero List Group, and zero ListGroup.Items with empty array', () => {
    const wrapper = shallow(
        <ScriptList scriptList={emptyScripts} activeIndex={0} />
    );
    expect(wrapper.find(ListGroup)).toHaveLength(0);
    expect(wrapper.find(ListGroup.Item)).toHaveLength(0);
});

it('should render one <p> with a create script message if scripts is empty', () => {
    const wrapper = shallow(
        <ScriptList scriptList={emptyScripts} activeIndex={0} />
    );
    expect(wrapper.find('.create-script-message')).toHaveLength(1);
});

it('renders the script names in the list', () => {
    const { getByText } = render(
        <ScriptList scriptList={scripts} activeIndex={0} />
    );
    expect(getByText('script1')).toBeInTheDocument();
    expect(getByText('script2')).toBeInTheDocument();
});
