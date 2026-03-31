import React from 'react';
import { render, screen } from '@testing-library/react';
import YouTubeRecordingForm from './YouTubeRecordingForm';

// Mock the fetch function
global.fetch = jest.fn();

describe('YouTubeRecordingForm', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('renders YouTube recording form', () => {
        render(<YouTubeRecordingForm />);
        
        // Check if the main elements are rendered
        expect(screen.getByText('YouTube Recording')).toBeInTheDocument();
        expect(screen.getByText('Schedule YouTube video recordings with quality control')).toBeInTheDocument();
        expect(screen.getByLabelText('YouTube Video ID or URL')).toBeInTheDocument();
        expect(screen.getByLabelText('Recording Title')).toBeInTheDocument();
        expect(screen.getByText('Test Video')).toBeInTheDocument();
        expect(screen.getByText('Schedule Recording')).toBeInTheDocument();
    });

    test('renders quality options', () => {
        render(<YouTubeRecordingForm />);
        
        // Check if quality options are rendered
        expect(screen.getByText('Low (360p)')).toBeInTheDocument();
        expect(screen.getByText('Medium (720p)')).toBeInTheDocument();
        expect(screen.getByText('High (1080p)')).toBeInTheDocument();
        expect(screen.getByText('Ultra (1080p VP9)')).toBeInTheDocument();
    });

    test('renders duration options', () => {
        render(<YouTubeRecordingForm />);
        
        // Check if duration options are rendered
        expect(screen.getByText('5 minutes')).toBeInTheDocument();
        expect(screen.getByText('30 minutes')).toBeInTheDocument();
        expect(screen.getByText('1 hour')).toBeInTheDocument();
        expect(screen.getByText('2 hours')).toBeInTheDocument();
    });
}); 