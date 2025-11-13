import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ShotDetailsModal, { ShotDetails } from '../ShotDetailsModal';

describe('ShotDetailsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    runs: 4,
    isWicket: false,
    batsmanName: 'Test Batsman',
    bowlerName: 'Test Bowler',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when visible is true', () => {
    const { getByText } = render(<ShotDetailsModal {...defaultProps} />);
    expect(getByText('4 Runs Details')).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <ShotDetailsModal {...defaultProps} visible={false} />
    );
    expect(queryByText('4 Runs Details')).toBeNull();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByText } = render(<ShotDetailsModal {...defaultProps} />);
    const closeButton = getByText('✕');
    fireEvent.press(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm with empty shot details when confirmed without selections', () => {
    const { getByText } = render(<ShotDetailsModal {...defaultProps} />);
    const confirmButton = getByText('Confirm Shot Details');
    fireEvent.press(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalledWith({});
  });

  it('should display wicket details when isWicket is true', () => {
    const { getByText } = render(
      <ShotDetailsModal {...defaultProps} isWicket={true} runs={0} />
    );
    expect(getByText('Wicket Details')).toBeTruthy();
  });

  it('should display correct runs text', () => {
    const { getByText, rerender } = render(
      <ShotDetailsModal {...defaultProps} runs={1} />
    );
    expect(getByText('1 Run Details')).toBeTruthy();

    rerender(<ShotDetailsModal {...defaultProps} runs={6} />);
    expect(getByText('6 Runs Details')).toBeTruthy();
  });
});

