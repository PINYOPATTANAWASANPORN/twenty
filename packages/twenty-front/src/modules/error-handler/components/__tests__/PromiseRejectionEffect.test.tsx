import { render } from '@testing-library/react';

import { PromiseRejectionEffect } from '@/error-handler/components/PromiseRejectionEffect';

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({
    enqueueToast: mockEnqueueToast,
  }),
}));

jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}));

const dispatchUnhandledRejection = (reason: unknown) => {
  const event = new Event('unhandledrejection') as any;
  event.reason = reason;
  window.dispatchEvent(event);
};

describe('PromiseRejectionEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should suppress Safari US spelling "Canceled" TypeError', () => {
    render(<PromiseRejectionEffect />);

    dispatchUnhandledRejection(new TypeError('Canceled'));

    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('should suppress UK spelling "cancelled" TypeError', () => {
    render(<PromiseRejectionEffect />);

    dispatchUnhandledRejection(new TypeError('cancelled'));

    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('should suppress standard AbortError', () => {
    render(<PromiseRejectionEffect />);

    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    dispatchUnhandledRejection(abortError);

    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('should suppress abort error wrapped in networkError', () => {
    render(<PromiseRejectionEffect />);

    dispatchUnhandledRejection({
      networkError: { name: 'AbortError' },
    });

    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('should enqueue toast for regular unhandled errors', () => {
    render(<PromiseRejectionEffect />);

    dispatchUnhandledRejection(new Error('Network request failed'));

    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
  });
});
