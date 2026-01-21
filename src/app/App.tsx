import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckeredPattern } from './components/CheckeredPattern';
import { ParticleExplosion } from './components/ParticleExplosion';
import { AudioBars } from './components/AudioBars';
import { 
  getProgress, 
  getDailyChallengeAsync, 
  recordAttempt, 
  getDailyProgress,
  getAllTimeProgress,
  type UserProgress 
} from '@/utils/storage';
import { playTextToSpeech, prefetchAudio } from '@/utils/elevenlabs';
import { 
  startListening, 
  scorePronunciation, 
  getFeedback,
  getRating,
  isSpeechRecognitionAvailable,
  getSpeechRecognitionError 
} from '@/utils/speech-recognition';
import {
  initAudio,
  playStartRecord,
  playStopRecord,
  playSuccess,
  playPerfect,
  playError,
  playPartial,
  playLevelUp,
} from '@/utils/sounds';

// Theme configuration
const THEMES = [
  { id: 1, background: '#571304', accent: '#ACFFD6' },
  { id: 2, background: '#277942', accent: '#FFE3AC' },
  { id: 3, background: '#274A79', accent: '#FFACE6' },
];

function getDailyTheme() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return THEMES[dayOfYear % THEMES.length];
}

// Dynamic font size to keep text on one line - responsive with clamp()
function getFontSize(text: string): string {
  const len = text.length;
  // Base sizes that scale with viewport width (min, preferred, max)
  if (len <= 8) return 'clamp(40px, 12vw, 60px)';
  if (len <= 12) return 'clamp(32px, 10vw, 48px)';
  if (len <= 18) return 'clamp(26px, 8vw, 36px)';
  if (len <= 25) return 'clamp(22px, 6vw, 28px)';
  if (len <= 35) return 'clamp(18px, 5vw, 22px)';
  if (len <= 50) return 'clamp(16px, 4vw, 18px)';
  return 'clamp(14px, 3.5vw, 16px)';
}

// Responsive sizing CSS custom properties
const responsiveStyles = {
  // Checker height: 4 units where unit = 100vw/15, same as CheckeredPattern
  checkerHeight: 'calc(100vw / 15 * 4)',
  // Frame padding: scales with viewport (increased 25%)
  framePadding: 'clamp(30px, 7.5vw, 60px)',
  // Circle size: 140px min, 194px max
  circleSize: 'clamp(140px, 30vw, 194px)',
  // Large circle for complete screen
  circleSizeLarge: 'clamp(200px, 45vw, 300px)',
  // Button width
  buttonWidth: 'clamp(240px, 70vw, 306px)',
  // Button height
  buttonHeight: 'clamp(44px, 8vh, 56px)',
  // Gap between elements
  gap: 'clamp(16px, 4vh, 32px)',
};

export default function App() {
  const theme = getDailyTheme();
  
  const [progress, setProgress] = useState<UserProgress>(getProgress);
  const [currentText, setCurrentText] = useState<string>('');
  const [dailyProgress, setDailyProgress] = useState(getDailyProgress);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showExplosion, setShowExplosion] = useState(false);
  const [checkersExploding, setCheckersExploding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedProgress, setDisplayedProgress] = useState(0);
  
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  // Initialize daily challenge and load first item
  useEffect(() => {
    const initChallenge = async () => {
      // Get adaptive daily challenge with AI-generated content
      const challenge = await getDailyChallengeAsync();
      
      if (challenge.currentIndex >= challenge.items.length) {
        setChallengeComplete(true);
        return;
      }
      
      const item = challenge.items[challenge.currentIndex];
      setCurrentText(item.text);
      setProgress(getProgress());
      setDailyProgress(getDailyProgress());
      prefetchAudio(item.text).catch(() => {});
    };
    
    initChallenge();
  }, []);
  
  // Load next item
  const loadNextItem = useCallback(() => {
    const prog = getProgress();
    const challenge = prog.dailyChallenge;
    
    if (!challenge || challenge.currentIndex >= challenge.items.length) {
      setChallengeComplete(true);
      return;
    }
    
    const item = challenge.items[challenge.currentIndex];
    setCurrentText(item.text);
    setFeedback('');
    setDailyProgress(getDailyProgress());
    prefetchAudio(item.text).catch(() => {});
  }, []);
  
  // Initialize audio on first interaction
  const handleFirstInteraction = useCallback(async () => {
    await initAudio();
  }, []);
  
  // Play pronunciation
  const handleListen = useCallback(async () => {
    if (!currentText || isPlaying) return;
    
    await handleFirstInteraction();
    setIsPlaying(true);
    
    try {
      await playTextToSpeech(currentText);
    } catch (err) {
      console.error('TTS error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Could not play audio';
      setError(errorMessage);
    } finally {
      setIsPlaying(false);
    }
  }, [currentText, isPlaying, handleFirstInteraction]);
  
  // Handle recording
  const handleRecord = useCallback(async () => {
    if (!currentText || isRecording) return;
    
    await handleFirstInteraction();
    
    if (!isSpeechRecognitionAvailable()) {
      setError(getSpeechRecognitionError());
      return;
    }
    
    // Request microphone permission first (needed for iOS Safari)
    try {
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err: unknown) {
      const error = err as Error & { name?: string };
      console.error('Mic permission error:', error.name, error.message);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Mic blocked. Tap ⓘ in address bar → Website Settings → Microphone → Allow');
      } else if (error.name === 'NotFoundError') {
        setError('No microphone found on this device.');
      } else {
        setError(`Mic error: ${error.message || 'unknown'}`);
      }
      return;
    }
    
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
    }
    
    setIsRecording(true);
    setFeedback('');
    playStartRecord();
    
    try {
      const result = await startListening();
      playStopRecord();
      setIsRecording(false);
      
      // Use confidence from speech recognition for more accurate scoring
      const score = scorePronunciation(currentText, result.transcript, result.confidence);
      const rating = getRating(score);
      const feedbackText = getFeedback(score);
      
      setFeedback(feedbackText);
      
      const isPerfectScore = rating === 'perfect';
      const isGoodOrPerfect = rating === 'perfect' || rating === 'good';
      
      const { shouldAdvance, challengeComplete: complete, progress: newProgress } = recordAttempt(
        isGoodOrPerfect,
        isPerfectScore,
        score
      );
      
      setProgress(newProgress);
      setDailyProgress(getDailyProgress());
      
      if (isPerfectScore) {
        playPerfect();
        setShowExplosion(true);
        setCheckersExploding(true);
        
        // Load next word IMMEDIATELY when celebration starts (not after delay)
        if (complete) {
          setIsTransitioning(true);
          playLevelUp();
          advanceTimeoutRef.current = setTimeout(() => {
            setShowExplosion(false);
            setCheckersExploding(false);
            setChallengeComplete(true);
          }, 1500);
        } else if (shouldAdvance) {
          // Change word right away, celebration plays over it
          loadNextItem();
          advanceTimeoutRef.current = setTimeout(() => {
            setShowExplosion(false);
            setCheckersExploding(false);
          }, 1000);
        }
      } else if (isGoodOrPerfect) {
        playSuccess();
        // Good score - advance after brief feedback display
        if (complete) {
          advanceTimeoutRef.current = setTimeout(() => {
            setIsTransitioning(true);
            playLevelUp();
            setTimeout(() => setChallengeComplete(true), 1500);
          }, 800);
        } else if (shouldAdvance) {
          advanceTimeoutRef.current = setTimeout(() => {
            loadNextItem();
          }, 600);
        }
      } else if (rating === 'ok') {
        playPartial();
        // OK score - might need to retry
        if (shouldAdvance) {
          advanceTimeoutRef.current = setTimeout(() => {
            loadNextItem();
          }, 800);
        }
      } else {
        playError();
        // Failed - might advance after 3 attempts
        if (shouldAdvance) {
          advanceTimeoutRef.current = setTimeout(() => {
            loadNextItem();
          }, 800);
        }
      }
      
    } catch (err) {
      console.error('Recognition error:', err);
      setIsRecording(false);
      playStopRecord();
      const errorMessage = err instanceof Error ? err.message : 'Could not recognize speech. Try again.';
      setError(errorMessage);
    }
  }, [currentText, isRecording, handleFirstInteraction, loadNextItem]);
  
  // Animate progress counter when transitioning or complete
  useEffect(() => {
    if (isTransitioning || challengeComplete) {
      const targetProgress = dailyProgress * 100;
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = targetProgress / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetProgress) {
          setDisplayedProgress(targetProgress);
          clearInterval(timer);
        } else {
          setDisplayedProgress(current);
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isTransitioning, challengeComplete, dailyProgress]);
  
  // Clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, []);
  
  // Challenge complete screen
  if (challengeComplete || isTransitioning) {
    // Get the rating to display
    const completionRating = dailyProgress >= 0.8 ? 'gooood' : dailyProgress >= 0.5 ? 'okkkkk' : 'done';
    // Get adaptive all-time progress (based on historical performance)
    const allTimeProgress = getAllTimeProgress();
    
    return (
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{ backgroundColor: theme.background }}
      >
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          <CheckeredPattern accentColor={theme.accent} position="top" exploding={false} />
          
          {/* Main content - safe area aware, responsive, same padding as challenge screen */}
          <div 
            className="flex-1 flex flex-col items-center justify-between"
            style={{ 
              paddingTop: `calc(env(safe-area-inset-top, 0px) + ${responsiveStyles.checkerHeight} + ${responsiveStyles.framePadding})`,
              paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${responsiveStyles.checkerHeight} + ${responsiveStyles.framePadding})`,
              paddingLeft: `max(env(safe-area-inset-left, 0px), ${responsiveStyles.framePadding})`,
              paddingRight: `max(env(safe-area-inset-right, 0px), ${responsiveStyles.framePadding})`,
            }}
          >
            {/* Day label + Rating word */}
            <div className="flex flex-col items-center" style={{ gap: 2 }}>
              <span 
                className="font-bricolage font-bold animate-fade-in"
                style={{ color: theme.accent, letterSpacing: '-0.022em', fontSize: 'clamp(16px, 4vw, 20px)' }}
              >
                day {progress.currentDay}
              </span>
              <span 
                className="font-bricolage font-bold animate-fade-in"
                style={{ color: theme.accent, letterSpacing: '-0.022em', lineHeight: 1.2, animationDelay: '0.1s', fontSize: 'clamp(40px, 12vw, 60px)' }}
              >
                {completionRating}
              </span>
            </div>
            
            {/* Two progress circles */}
            <div className="flex flex-col items-center" style={{ gap: responsiveStyles.gap }}>
              {/* Today's progress circle */}
              <div 
                className="relative animate-fade-in"
                style={{ animationDelay: '0.2s', width: responsiveStyles.circleSize, height: responsiveStyles.circleSize }}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 194 194">
                  <circle cx="97" cy="97" r="83" stroke="white" strokeOpacity="0.2" strokeWidth="22" fill="none" />
                </svg>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 194 194" style={{ transform: 'rotate(-90deg)' }}>
                  <circle 
                    cx="97" cy="97" r="83" 
                    stroke={theme.accent} strokeWidth="22" fill="none"
                    strokeDasharray={`${(displayedProgress / 100) * 521.5} 521.5`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                    style={{ filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.02)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.06))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 0 }}>
                  <span className="font-bricolage font-bold" style={{ color: theme.accent, letterSpacing: '-0.022em', fontSize: 'clamp(24px, 6vw, 32px)', lineHeight: 1.1 }}>
                    {Math.round(displayedProgress)}%
                  </span>
                  <span className="font-bricolage font-bold" style={{ color: theme.accent, letterSpacing: '-0.022em', fontSize: 'clamp(14px, 3.5vw, 20px)' }}>
                    today
                  </span>
                </div>
              </div>
              
              {/* All-time progress circle */}
              <div 
                className="relative animate-fade-in"
                style={{ animationDelay: '0.4s', width: responsiveStyles.circleSize, height: responsiveStyles.circleSize }}
              >
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 194 194">
                  <circle cx="97" cy="97" r="83" stroke="white" strokeOpacity="0.2" strokeWidth="22" fill="none" />
                </svg>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 194 194" style={{ transform: 'rotate(-90deg)' }}>
                  <circle 
                    cx="97" cy="97" r="83" 
                    stroke={theme.accent} strokeWidth="22" fill="none"
                    strokeDasharray={`${(allTimeProgress / 100) * 521.5} 521.5`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                    style={{ filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.02)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.06))', transitionDelay: '0.5s' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 0 }}>
                  <span className="font-bricolage font-bold" style={{ color: theme.accent, letterSpacing: '-0.022em', fontSize: 'clamp(24px, 6vw, 32px)', lineHeight: 1.1 }}>
                    {Math.round(allTimeProgress)}%
                  </span>
                  <span className="font-bricolage font-bold" style={{ color: theme.accent, letterSpacing: '-0.022em', fontSize: 'clamp(14px, 3.5vw, 20px)' }}>
                    all time
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <CheckeredPattern accentColor={theme.accent} position="bottom" exploding={false} />
          
          {/* Debug reset button */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="absolute top-2 right-2 px-2 py-1 text-xs opacity-30 hover:opacity-100 rounded z-50"
            style={{ backgroundColor: theme.accent, color: theme.background }}
          >
            RESET
          </button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (!currentText) {
    return (
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{ backgroundColor: theme.background }}
      >
        <div className="relative w-full h-full flex flex-col">
          <CheckeredPattern accentColor={theme.accent} position="top" exploding={false} />
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="animate-spin w-16 h-16 border-4 rounded-full"
              style={{ borderColor: `${theme.accent} transparent transparent transparent` }}
            />
          </div>
          <CheckeredPattern accentColor={theme.accent} position="bottom" exploding={false} />
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: theme.background }}
    >
      {/* Container - full width, fills screen, clips overflow */}
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        
        <CheckeredPattern 
          accentColor={theme.accent} 
          position="top" 
          exploding={checkersExploding}
        />
        
        {/* Main content - safe area aware, responsive frame */}
        <div 
          className="flex-1 flex flex-col justify-between items-center"
          style={{ 
            paddingTop: `calc(env(safe-area-inset-top, 0px) + ${responsiveStyles.checkerHeight} + ${responsiveStyles.framePadding})`,
            paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${responsiveStyles.checkerHeight} + ${responsiveStyles.framePadding})`,
            paddingLeft: `max(env(safe-area-inset-left, 0px), ${responsiveStyles.framePadding})`,
            paddingRight: `max(env(safe-area-inset-right, 0px), ${responsiveStyles.framePadding})`,
          }}
        >
          
          {/* Day label - only renders during transition */}
          {isTransitioning && (
            <div className="animate-fade-in">
              <span 
                className="font-bricolage font-bold"
                style={{ 
                  color: theme.accent, 
                  letterSpacing: '-0.022em',
                  fontSize: 'clamp(16px, 4vw, 20px)',
                }}
              >
                day {progress.currentDay}
              </span>
            </div>
          )}
          
          {/* Word/Phrase - changes to rating during transition */}
          <h1 
            className="font-bricolage font-bold text-center w-full whitespace-nowrap overflow-hidden transition-all duration-700"
            style={{ 
              color: theme.accent, 
              lineHeight: 1.2, 
              letterSpacing: '-0.022em',
              fontSize: isTransitioning ? 'clamp(40px, 12vw, 60px)' : getFontSize(currentText),
            }}
          >
            {isTransitioning 
              ? (dailyProgress >= 0.8 ? 'gooood' : dailyProgress >= 0.5 ? 'okkkkk' : 'done')
              : currentText
            }
          </h1>
          
          {/* Progress ring - grows during transition */}
          <div 
            className="relative transition-all duration-300 ease-out"
            style={{ 
              width: isTransitioning ? responsiveStyles.circleSizeLarge : responsiveStyles.circleSize,
              height: isTransitioning ? responsiveStyles.circleSizeLarge : responsiveStyles.circleSize,
            }}
          >
            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 194 194">
              <circle 
                cx="97" 
                cy="97" 
                r="83" 
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="22"
                fill="none"
              />
            </svg>
            
            {/* Progress ring */}
            <svg 
              className="absolute inset-0 w-full h-full" 
              viewBox="0 0 194 194"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle 
                cx="97" 
                cy="97" 
                r="83" 
                stroke={theme.accent}
                strokeWidth="22"
                fill="none"
                strokeDasharray={`${(isTransitioning ? displayedProgress / 100 : dailyProgress) * 521.5} 521.5`}
                strokeLinecap="round"
                className="transition-all duration-500"
                style={{
                  filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.02)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.06))',
                }}
              />
            </svg>
            
            {/* Center content - feedback or percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="font-bricolage font-bold tracking-tight text-center transition-all duration-500"
                style={{ 
                  color: theme.accent,
                  fontSize: isTransitioning ? 'clamp(24px, 6vw, 32px)' : 'clamp(16px, 4vw, 20px)',
                }}
              >
                {isTransitioning ? `${Math.round(displayedProgress)}%` : feedback}
              </span>
            </div>
          </div>
          
          {/* Buttons: Mic and Play - fade out during transition, dim when loading next */}
          <div 
            className="flex items-center transition-all duration-500"
            style={{ 
              width: responsiveStyles.buttonWidth,
              gap: 'clamp(16px, 4vw, 32px)',
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
              pointerEvents: isTransitioning ? 'none' : 'auto',
            }}
          >
            {/* Mic button */}
            <button
              onClick={handleRecord}
              disabled={isRecording}
              className={`
                flex-1 rounded-[20px] border-2 
                flex items-center justify-center
                transition-all duration-200
                ${isRecording ? 'scale-[1.02]' : 'hover:scale-[1.02] active:scale-95'}
              `}
              style={{ 
                height: responsiveStyles.buttonHeight,
                borderColor: theme.accent,
                backgroundColor: isRecording ? theme.accent : 'transparent',
              }}
              aria-label={isRecording ? 'Recording...' : 'Tap to speak'}
            >
              {isRecording ? (
                <AudioBars isActive={isRecording} color={theme.background} />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <line x1="12" y1="18" x2="12" y2="21" />
                </svg>
              )}
            </button>
            
            {/* Play button */}
            <button
              onClick={handleListen}
              disabled={isPlaying}
              className={`
                flex-1 rounded-[20px] border-2 
                flex items-center justify-center
                transition-all duration-200
                ${isPlaying ? 'opacity-50' : 'hover:scale-[1.02] active:scale-95'}
              `}
              style={{ 
                height: responsiveStyles.buttonHeight,
                borderColor: theme.accent,
              }}
              aria-label={isPlaying ? 'Playing...' : 'Listen'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <polygon points="10,8 16,12 10,16" fill={theme.accent} stroke="none" />
              </svg>
            </button>
          </div>
          
          {/* Stats section - fades out during transition */}
          <div 
            className="flex flex-col transition-all duration-500"
            style={{ 
              width: responsiveStyles.buttonWidth,
              gap: 'clamp(12px, 3vw, 16px)',
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
            }}
          >
            {/* Horizontal divider */}
            <div 
              className="w-full h-0.5"
              style={{ backgroundColor: theme.accent }}
            />
            
            {/* Stats row */}
            <div className="flex justify-between items-center">
              {/* Day */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <span 
                  className="font-bricolage font-bold lowercase"
                  style={{ color: theme.accent, fontSize: 'clamp(16px, 4vw, 20px)' }}
                >
                  day
                </span>
                <span 
                  className="font-bricolage font-bold"
                  style={{ color: theme.accent, fontSize: 'clamp(16px, 4vw, 20px)' }}
                >
                  {progress.currentDay}
                </span>
              </div>
              
              {/* Vertical divider */}
              <div 
                className="w-0.5"
                style={{ backgroundColor: theme.accent, height: responsiveStyles.buttonHeight }}
              />
              
              {/* Difficulty */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <span 
                  className="font-bricolage font-bold lowercase"
                  style={{ color: theme.accent, fontSize: 'clamp(16px, 4vw, 20px)' }}
                >
                  difficulty
                </span>
                <span 
                  className="font-bricolage font-bold"
                  style={{ color: theme.accent, fontSize: 'clamp(16px, 4vw, 20px)' }}
                >
                  {progress.currentLevel}
                </span>
              </div>
            </div>
          </div>
          
        </div>
        
        <CheckeredPattern 
          accentColor={theme.accent} 
          position="bottom"
          exploding={checkersExploding}
        />
        
        {/* Error toast */}
        {error && (
          <div 
            className="absolute bottom-32 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg font-instrument text-sm animate-bounce-in max-w-[320px] text-center shadow-lg"
            style={{ 
              backgroundColor: theme.accent,
              color: theme.background,
            }}
          >
            {error}
          </div>
        )}
      </div>
      
      <ParticleExplosion
        active={showExplosion}
        accentColor={theme.accent}
      />
      
      {/* Debug reset button - remove for production */}
      <button
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        className="absolute top-2 right-2 px-2 py-1 text-xs opacity-30 hover:opacity-100 rounded"
        style={{ backgroundColor: theme.accent, color: theme.background }}
      >
        RESET
      </button>
    </div>
  );
}
