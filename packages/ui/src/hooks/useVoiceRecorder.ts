import { useState, useRef, useCallback } from 'react';

export interface VoiceRecorderHook {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  cancelRecording: () => void;
  clearAudio: () => void;
}

export function useVoiceRecorder(): VoiceRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerInterval = useRef<number | null>(null);
  const chunks = useRef<Blob[]>([]);
  const isPausedRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true
        } 
      });
      
      // WhatsApp prefers audio/ogg; codecs=opus for PTT
      const mimeType = MediaRecorder.isTypeSupported('audio/ogg; codecs=opus') 
        ? 'audio/ogg; codecs=opus' 
        : 'audio/webm; codecs=opus';
        
      mediaRecorder.current = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 24000 // 24 kbps within 16-32 range
      });
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setIsPaused(false);
      isPausedRef.current = false;
      setDuration(0);

      timerInterval.current = window.setInterval(() => {
        if (!isPausedRef.current) {
          setDuration(prev => prev + 1);
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      throw err;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && !isPausedRef.current) {
      mediaRecorder.current.pause();
      isPausedRef.current = true;
      setIsPaused(true);
    }
  }, [isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording && isPausedRef.current) {
      mediaRecorder.current.resume();
      isPausedRef.current = false;
      setIsPaused(false);
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      isPausedRef.current = false;
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      isPausedRef.current = false;
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
    }
  }, [isRecording]);

  const clearAudio = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPaused(false);
    isPausedRef.current = false;
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    clearAudio
  };
}
