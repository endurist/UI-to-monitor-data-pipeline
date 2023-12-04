import React from 'react';
import { shallow, mount } from 'enzyme';
import Home from '../components/Home';

it('renders without crashing', () => {
    shallow(<Home />);
});

// test home title
it('renders Home title', () => {
    const wrapper = shallow(<Home />);
    const header = <h1>Data Pipeline Monitoring System</h1>;
    expect(wrapper.contains(header)).toEqual(true);
});

// test home body
it('renders Home body', () => {
    const wrapper = shallow(<Home />);
    const body = (
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates
            doloremque culpa placeat laudantium ducimus sequi? Ad sequi ipsam
            quisquam minus ratione alias earum a expedita vero in, iure cum
            vitae? Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Voluptates doloremque culpa placeat laudantium ducimus sequi? Ad
            sequi ipsam quisquam minus ratione alias earum a expedita vero in,
            iure cum vitae?
        </p>
    );
    expect(wrapper.contains(body)).toEqual(true);
});

// test button click
