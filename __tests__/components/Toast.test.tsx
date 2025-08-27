import React from 'react';
import { render } from '@testing-library/react-native';
import Toast from '../../src/components/Toast';

// Mock the ToastContext
const mockHideToast = jest.fn();

const mockToastContext = {
  toast: {
    visible: true,
    message: 'Test message',
    type: 'error',
    onRetry: undefined,
  },
  hideToast: mockHideToast,
  showToast: jest.fn(),
};

jest.mock('../../src/contexts/ToastContext', () => ({
  useToast: () => mockToastContext,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock react-native-paper theme
jest.mock('react-native-paper', () => ({
  useTheme: () => ({
    colors: {
      error: '#FF0000',
      errorContainer: '#FFE0E0',
      onError: '#FFFFFF',
    },
  }),
  Snackbar: ({ children, visible, onDismiss, action, ...props }: any) => {
    if (!visible) return null;
    return (
      <div {...props} testID="snackbar" onClick={onDismiss}>
        {children}
        {action && (
          <button testID="retry-button" onClick={action.onPress}>
            {action.label}
          </button>
        )}
      </div>
    );
  },
}));

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible', () => {
    mockToastContext.toast.visible = true;
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('does not render when not visible', () => {
    mockToastContext.toast.visible = false;
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeFalsy(); // Component returns null when not visible
  });

  it('renders with default message', () => {
    mockToastContext.toast.visible = true;
    mockToastContext.toast.message = 'Test message';
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing', () => {
    mockToastContext.toast.visible = true;
    expect(() => render(<Toast />)).not.toThrow();
  });

  it('handles different message types', () => {
    mockToastContext.toast.visible = true;
    mockToastContext.toast.type = 'success';
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles empty message', () => {
    mockToastContext.toast.visible = true;
    mockToastContext.toast.message = '';
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles long message', () => {
    mockToastContext.toast.visible = true;
    const longMessage =
      'This is a very long error message that should be handled properly';
    mockToastContext.toast.message = longMessage;
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles special characters in message', () => {
    mockToastContext.toast.visible = true;
    const specialMessage = 'Error: Invalid input "test@example.com"';
    mockToastContext.toast.message = specialMessage;
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles undefined onRetry', () => {
    mockToastContext.toast.visible = true;
    mockToastContext.toast.onRetry = undefined;
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles function onRetry', () => {
    mockToastContext.toast.visible = true;
    const functionOnRetry = () => console.log('retry');
    mockToastContext.toast.onRetry = functionOnRetry;
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('handles null onRetry', () => {
    mockToastContext.toast.visible = true;
    mockToastContext.toast.onRetry = null;
    const { toJSON } = render(<Toast />);
    expect(toJSON()).toBeTruthy();
  });

  it('invokes onRetry and hides toast when retry button pressed', () => {
    const onRetryMock = jest.fn();
    mockToastContext.toast.visible = true;
    mockToastContext.toast.onRetry = onRetryMock;

    const { getByTestId } = render(<Toast />);
    const retryBtn = getByTestId('retry-button');
    retryBtn.props.onClick();

    expect(onRetryMock).toHaveBeenCalled();
    expect(mockHideToast).toHaveBeenCalled();
  });

  it('hides toast when retry button pressed without onRetry', () => {
    mockToastContext.toast.visible = true;
    mockToastContext.toast.onRetry = undefined;

    const { getByTestId } = render(<Toast />);
    // Snackbar should render without retry button; clicking container should dismiss
    const snackbar = getByTestId('snackbar');
    snackbar.props.onClick();
    expect(mockHideToast).toHaveBeenCalled();
  });
});
