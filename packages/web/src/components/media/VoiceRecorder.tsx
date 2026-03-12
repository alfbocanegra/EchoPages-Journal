import React, { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscription, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if MediaRecorder is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      setIsSupported(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Set up audio level monitoring
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start audio level monitoring
      const monitorAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationRef.current = requestAnimationFrame(monitorAudioLevel);
        }
      };

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        await transcribeAudio(audioBlob);

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        setAudioLevel(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start audio level monitoring
      monitorAudioLevel();
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:3001/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onTranscription(data.transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      onError?.('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div
        style={{
          padding: '12px',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          color: '#856404',
          fontSize: '14px',
        }}
      >
        Voice recording is not supported in your browser.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        background: isRecording ? '#f8f9fa' : 'transparent',
        borderRadius: '12px',
        border: isRecording ? '2px solid #dc3545' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: 'none',
          background: isRecording ? '#dc3545' : '#007bff',
          color: 'white',
          fontSize: '20px',
          cursor: isTranscribing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: isRecording
            ? '0 0 20px rgba(220, 53, 69, 0.5)'
            : '0 2px 8px rgba(0, 123, 255, 0.3)',
          transform: isRecording ? 'scale(1.1)' : 'scale(1)',
        }}
        aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
      >
        {isTranscribing ? '⏳' : isRecording ? '⏹️' : '🎤'}
      </button>

      {isRecording && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#dc3545',
              }}
            >
              Recording: {formatTime(recordingTime)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Level:</span>
              <div
                style={{
                  width: '100px',
                  height: '4px',
                  background: '#e9ecef',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${audioLevel * 100}%`,
                    height: '100%',
                    background:
                      audioLevel > 0.7 ? '#dc3545' : audioLevel > 0.3 ? '#ffc107' : '#28a745',
                    transition: 'width 0.1s ease',
                  }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Click stop when finished speaking
          </div>
        </>
      )}

      {isTranscribing && (
        <div
          style={{
            fontSize: '14px',
            color: '#007bff',
            fontWeight: '500',
          }}
        >
          Transcribing audio...
        </div>
      )}

      {!isRecording && !isTranscribing && (
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          Click to start voice recording
        </div>
      )}
    </div>
  );
};
