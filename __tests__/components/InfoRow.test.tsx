import React from 'react';
import { render } from '@testing-library/react-native';
import { InfoRow } from '../../src/screens/Details/components/InfoRow';

describe('InfoRow Component', () => {
  const mockTheme = {
    colors: {
      primary: '#007AFF',
      onSurfaceVariant: '#666666',
      onSurface: '#000000',
    },
  } as any;

  const defaultProps = {
    label: 'Market Cap',
    value: '2.5T',
    theme: mockTheme,
  };

  it('renders correctly with all props', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} icon="💰" />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
    expect(getByText('💰')).toBeTruthy();
  });

  it('renders without icon', () => {
    const { getByText, queryByText, toJSON } = render(
      <InfoRow {...defaultProps} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
    expect(queryByText('💰')).toBeFalsy();
  });

  it('renders with null value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={null} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('N/A')).toBeTruthy();
  });

  it('renders with undefined value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={undefined} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('N/A')).toBeTruthy();
  });

  it('renders with boolean true value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={true} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('Yes')).toBeTruthy();
  });

  it('renders with boolean false value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={false} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('No')).toBeTruthy();
  });

  it('renders with number value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={25.5} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('25.5')).toBeTruthy();
  });

  it('renders with zero value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={0} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
  });

  it('renders with negative number value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={-2.5} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('-2.5')).toBeTruthy();
  });

  it('renders with string value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value="Technology" />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('Technology')).toBeTruthy();
  });

  it('renders with empty string value', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value="" />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('')).toBeTruthy();
  });

  it('renders with long label', () => {
    const longLabel =
      'This is a very long label that might wrap to multiple lines';
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} label={longLabel} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText(longLabel)).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
  });

  it('renders with short label', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} label="Price" />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Price')).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
  });

  it('renders with empty label', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} label="" />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('')).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
  });

  it('renders with different theme colors', () => {
    const darkTheme = {
      colors: {
        primary: '#FF6B6B',
        onSurfaceVariant: '#CCCCCC',
        onSurface: '#FFFFFF',
      },
    } as any;

    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} theme={darkTheme} icon="💰" />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
    expect(getByText('💰')).toBeTruthy();
  });

  it('renders with missing theme properties gracefully', () => {
    const incompleteTheme = {
      colors: {
        primary: '#007AFF',
        // Missing onSurfaceVariant and onSurface
      },
    } as any;

    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} theme={incompleteTheme} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
  });

  it('renders with special characters in label', () => {
    const specialLabel = 'P/E Ratio (TTM)';
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} label={specialLabel} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText(specialLabel)).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
  });

  it('renders with special characters in value', () => {
    const specialValue = 'BRK-B';
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={specialValue} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText(specialValue)).toBeTruthy();
  });

  it('renders with emoji icon', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} icon="🚀" />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
    expect(getByText('🚀')).toBeTruthy();
  });

  it('renders with text icon', () => {
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} icon=">" />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('2.5T')).toBeTruthy();
    expect(getByText('>')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => render(<InfoRow {...defaultProps} />)).not.toThrow();
  });

  it('handles complex object values', () => {
    const complexValue = { key: 'value', nested: { data: 'test' } };
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={complexValue} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('[object Object]')).toBeTruthy();
  });

  it('handles array values', () => {
    const arrayValue = ['item1', 'item2', 'item3'];
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={arrayValue} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    expect(getByText('item1,item2,item3')).toBeTruthy();
  });

  it('handles function values', () => {
    const functionValue = () => 'function result';
    const { getByText, toJSON } = render(
      <InfoRow {...defaultProps} value={functionValue} />,
    );

    expect(toJSON()).toBeTruthy();
    expect(getByText('Market Cap')).toBeTruthy();
    // Function.toString() shows the function definition
    expect(getByText(/function functionValue\(\)/)).toBeTruthy();
  });
});
