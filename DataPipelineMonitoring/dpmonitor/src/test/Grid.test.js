import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { shallow } from 'enzyme';

import Grid from '../components/Grid';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';

afterEach(cleanup);

const rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxter', price: 72000 },
];
const fields = Object.keys(rowData[0]);
const rowData2 = [{ name: 'Bob' }];
const fields2 = Object.keys(rowData2[0]);

it('renders', () => {
    shallow(<Grid rowData={rowData} fields={fields} />);
});

it('should take a snapshot', () => {
    const { asFragment } = render(<Grid rowData={rowData} fields={fields} />);

    expect(
        asFragment(<Grid rowData={rowData} fields={fields} />)
    ).toMatchSnapshot();
});

it('should render one AgGridReact', () => {
    const wrapper = shallow(<Grid rowData={rowData} fields={fields} />);
    expect(wrapper.find(AgGridReact)).toHaveLength(1);
});

it('should render 3 AgGridColumns', () => {
    const wrapper = shallow(<Grid rowData={rowData} fields={fields} />);
    expect(wrapper.find(AgGridColumn)).toHaveLength(3);
});

it('should say No Rows To Show when data is empty', () => {
    const { getByText } = render(<Grid rowData={[]} fields={[]} />);
    expect(getByText('No Rows To Show')).toBeInTheDocument();
});

it('should not render any AgGridColumns with no data', () => {
    const wrapper = shallow(<Grid />);
    expect(wrapper.find(AgGridColumn)).toHaveLength(0);
});

it('should re-render the grid when the data is changed', () => {
    let wrapper = shallow(<Grid rowData={rowData} fields={fields} />);
    expect(wrapper.find(AgGridColumn)).toHaveLength(3);

    wrapper = shallow(<Grid rowData={rowData2} fields={fields2} />);
    expect(wrapper.find(AgGridColumn)).toHaveLength(1);
});
