import React from 'react';
import { render } from '@testing-library/react-native';
import Loader from '../../src/components/Loader';

describe('Loader', () => {
  it('renders without crashing', () => {
    expect(() => render(<Loader />)).not.toThrow();
  });

  it('renders successfully', () => {
    const { toJSON } = render(<Loader />);
    expect(toJSON()).toBeTruthy();
  });
});
