import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

// Mock the HTMLVideoElement APIs that are not supported/implemented in JSDOM or Happy DOM
beforeAll(() => {
  window.HTMLVideoElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
  window.HTMLVideoElement.prototype.pause = vi.fn();
  window.HTMLVideoElement.prototype.load = vi.fn();
  (window.HTMLVideoElement.prototype as any).requestPictureInPicture = vi.fn().mockImplementation(() => {
    return Promise.resolve({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });
  
  // Mock standard DOM properties if missing
  Object.defineProperty(HTMLMediaElement.prototype, 'duration', {
    configurable: true,
    get() {
      return 100; // Simulated duration of 100s
    },
  });
  
  Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
    configurable: true,
    writable: true,
    value: 0,
  });

  Object.defineProperty(HTMLMediaElement.prototype, 'buffered', {
    configurable: true,
    get() {
      return {
        length: 1,
        start: () => 0,
        end: () => 50,
      };
    },
  });
});

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockImplementation(() => Promise.resolve()),
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

describe('VideoPlayer', () => {
  const defaultProps = {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    title: 'Sintel (Cinematic Epic)',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000',
  };

  it('renders the VideoPlayer component correctly with title and poster', () => {
    const { container } = render(<VideoPlayer {...defaultProps} />);
    
    // Check that the main video element (with poster) is present
    const video = container.querySelector('video[poster]');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', defaultProps.src);
    expect(video).toHaveAttribute('poster', defaultProps.poster);
  });

  it('toggles setting panel view when clicking the setting gear icon', async () => {
    render(<VideoPlayer {...defaultProps} />);
    
    const settingsButton = screen.getByTitle('Configurações');
    expect(settingsButton).toBeInTheDocument();
    
    // Open settings popover
    fireEvent.click(settingsButton);
    expect(screen.getByText('Ajustes de Mídia')).toBeInTheDocument();
    expect(screen.getByText('Cinema Ambient Glow')).toBeInTheDocument();
    expect(screen.getByText('Repetir em Loop')).toBeInTheDocument();
  });

  it('changes playback speed inside settings menu', async () => {
    render(<VideoPlayer {...defaultProps} />);
    
    const settingsButton = screen.getByTitle('Configurações');
    fireEvent.click(settingsButton);
    
    // Click Playback Speed option
    const speedButton = screen.getByText('Velocidade');
    expect(speedButton).toBeInTheDocument();
    fireEvent.click(speedButton);
    
    // Check speed options are present
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('1.5x')).toBeInTheDocument();
    expect(screen.getByText('2x')).toBeInTheDocument();
  });

  it('triggers Picture-In-Picture trigger button without crashes', () => {
    render(<VideoPlayer {...defaultProps} />);
    
    const pipButton = screen.getByTitle('Picture-in-Picture do Navegador');
    expect(pipButton).toBeInTheDocument();
    
    fireEvent.click(pipButton);
    expect(window.HTMLVideoElement.prototype.requestPictureInPicture).toHaveBeenCalled();
  });

  it('renders mini mode placeholder when mini mode is active', () => {
    render(<VideoPlayer {...defaultProps} />);
    
    const miniButton = screen.getByTitle('Floating Miniplayer (In-App)');
    expect(miniButton).toBeInTheDocument();
    
    // Click mini mode button to transition to miniplayer
    fireEvent.click(miniButton);
    expect(screen.getByText('Vídeo em modo flutuante')).toBeInTheDocument();
    expect(screen.getByText('Restaurar Player')).toBeInTheDocument();
  });

  it('supports customized accent styling class', () => {
    const { container } = render(<VideoPlayer {...defaultProps} accentColor="bg-red-500" />);
    // Verify custom accent color prop is accepted and rendered in progress tracker
    const progressBar = container.querySelector('.bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });
});
