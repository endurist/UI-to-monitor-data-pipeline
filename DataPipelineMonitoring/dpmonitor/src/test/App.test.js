import React from 'react';
import { shallow, render } from 'enzyme';

import App from '../App';
import { Link } from 'react-router-dom';

it('renders without crashing', () => {
    shallow(<App />);
});

// it('renders five <Link /> components', () => {
//     const wrapper = shallow(<App />);
//     console.log(wrapper.debug());
//     expect(wrapper.find(Link)).toHaveLength(5);
// });

// it('renders nav bar text correctly', () => {});
