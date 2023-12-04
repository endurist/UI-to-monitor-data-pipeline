import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import Editor from '../components/Editor';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

afterEach(cleanup);

test('Editor window is rendered', () => {
    const { asFragment } = render(
        <Editor editorValue='example editor value' />
    );

    expect(
        asFragment(<Editor editorValue='example editor value' />)
    ).toMatchSnapshot();
});

test('Editor value should be equal to prop passed as value', () => {
    const wrapper = shallow(<Editor editorValue='test value' />);
    expect(wrapper.find('.ace-editor').at(0).props().value).toEqual(
        'test value'
    );
});

test('Editor placeholder is correct when empty', () => {
    const wrapper = shallow(<Editor editorValue='' />);
    expect(wrapper.find('.ace-editor').at(0).props().placeholder).toEqual(
        'Enter Script'
    );
});

test('Editor should be read only if passed readonly prop as true', () => {
    const wrapper = shallow(<Editor readOnly={true} />);
    expect(wrapper.find('.ace-editor').at(0).props().readOnly).toEqual(true);
});

test('Only one editor is rendered on the page', () => {
    const wrapper = shallow(
        <Editor editorValue='test value' readOnly={false} />
    );
    expect(wrapper.find('.ace-editor')).toHaveLength(1);
});

test('Two <Button /> components should be rendered', () => {
    const wrapper = shallow(
        <Editor editorValue='test value' readOnly={false} />
    );
    expect(wrapper.find(Button)).toHaveLength(2);
});

test('One <Form /> component should be rendered', () => {
    const wrapper = shallow(
        <Editor editorValue='test value' readOnly={false} />
    );
    expect(wrapper.find(Form)).toHaveLength(1);
});

test('The Form and Button texts should be rendered properly', () => {
    const { getByText } = render(
        <Editor editorValue='test value' readOnly={false} />
    );
    expect(getByText('Select Theme')).toBeInTheDocument();
    expect(getByText('Save Script')).toBeInTheDocument();
    expect(getByText('Schedule')).toBeInTheDocument();
});

test('Theme of the editor changes when the form option is clicked', () => {
    const container = render(<Editor editorValue='' readOnly={false} />);
    const formControl = container.getByTestId('theme-input');
    const optionSolarizedDark = container.getByTestId('solarized_dark');
    const optionTomorrow = container.getByTestId('tomorrow');

    expect(optionSolarizedDark.selected).toBe(true);
    expect(optionTomorrow.selected).toBe(false);

    fireEvent.change(formControl, { target: { value: 'tomorrow' } });

    expect(optionSolarizedDark.selected).toBe(false);
    expect(optionTomorrow.selected).toBe(true);
});
