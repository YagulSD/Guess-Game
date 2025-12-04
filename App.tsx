import React, { useState, useEffect, useCallback } from 'react';
import { TerminalOutput, TerminalInput } from './components/Terminal';
import { TerminalLine, LineType, GameMode, GameState } from './types';
import { generateRiddle } from './services/geminiService';

const BOOT_SEQUENCE = [
  "Initializing NeuroTerm v1.0...",
  "Loading core modules...",
  "Connecting to Neural Network...",
  "Connection established.",
  "Type 'help' for available commands."
];

export default function App() {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    mode: GameMode.IDLE,
    attempts: 0
  });

  // Helper to add lines to history
  const printLine = useCallback((content: string, type: LineType = LineType.OUTPUT) => {
    setHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type,
        content
      }
    ]);
  }, []);

  // Boot Effect
  useEffect(() => {
    let delay = 0;
    BOOT_SEQUENCE.forEach((msg, index) => {
      delay += 400 + Math.random() * 300;
      setTimeout(() => {
        printLine(msg, LineType.SYSTEM);
      }, delay);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Command Parser
  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    if (trimmed === 'help') {
      printLine("--- AVAILABLE COMMANDS ---", LineType.SYSTEM);
      printLine("  riddle  - Start AI Riddle Mode", LineType.OUTPUT);
      printLine("  number  - Start Number Guessing (1-100)", LineType.OUTPUT);
      printLine("  clear   - Clear terminal", LineType.OUTPUT);
      printLine("  exit    - Reboot terminal", LineType.OUTPUT);
      return;
    }

    if (trimmed === 'clear') {
      setHistory([]);
      printLine("Terminal cleared.", LineType.SYSTEM);
      return;
    }

    if (trimmed === 'exit') {
      window.location.reload();
      return;
    }

    if (trimmed === 'number') {
      const target = Math.floor(Math.random() * 100) + 1;
      setGameState({
        mode: GameMode.NUMBER_GUESS,
        attempts: 0,
        targetNumber: target
      });
      printLine("NUMBER GUESS MODE INITIALIZED", LineType.SUCCESS);
      printLine("I have selected a number between 1 and 100.", LineType.OUTPUT);
      printLine("Enter your guess:", LineType.SYSTEM);
      return;
    }

    if (trimmed === 'riddle') {
      setIsProcessing(true);
      printLine("Contacting AI for a new riddle...", LineType.SYSTEM);
      try {
        const riddleData = await generateRiddle();
        setGameState({
          mode: GameMode.RIDDLE_GUESS,
          attempts: 0,
          riddleData
        });
        printLine("RIDDLE GENERATED SUCCESSFULLY", LineType.SUCCESS);
        printLine(riddleData.question, LineType.AI);
        printLine("(Type 'hint' for a clue, or 'giveup' to forfeit)", LineType.SYSTEM);
      } catch (err) {
        printLine("Failed to generate riddle. Try again.", LineType.ERROR);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    printLine(`Command not found: '${trimmed}'. Type 'help' for list.`, LineType.ERROR);
  };

  // Game Logic Handler
  const handleGameInput = (guess: string) => {
    const cleanGuess = guess.trim();
    
    // Global abort commands
    if (cleanGuess.toLowerCase() === 'quit' || cleanGuess.toLowerCase() === 'exit') {
      setGameState({ mode: GameMode.IDLE, attempts: 0 });
      printLine("Game aborted. Returning to idle.", LineType.SYSTEM);
      return;
    }

    // NUMBER GUESS LOGIC
    if (gameState.mode === GameMode.NUMBER_GUESS) {
      const num = parseInt(cleanGuess);
      
      if (isNaN(num)) {
        printLine("Please enter a valid number.", LineType.ERROR);
        return;
      }

      const newAttempts = gameState.attempts + 1;
      setGameState(prev => ({ ...prev, attempts: newAttempts }));

      if (num === gameState.targetNumber) {
        printLine(`CORRECT! The number was ${gameState.targetNumber}.`, LineType.SUCCESS);
        printLine(`You won in ${newAttempts} attempts.`, LineType.SUCCESS);
        setGameState({ mode: GameMode.IDLE, attempts: 0 });
        printLine("Returning to shell...", LineType.SYSTEM);
      } else if (num < (gameState.targetNumber || 0)) {
        printLine(`Too low! (Attempt ${newAttempts})`, LineType.OUTPUT);
      } else {
        printLine(`Too high! (Attempt ${newAttempts})`, LineType.OUTPUT);
      }
      return;
    }

    // RIDDLE GUESS LOGIC
    if (gameState.mode === GameMode.RIDDLE_GUESS) {
      if (!gameState.riddleData) return;

      const newAttempts = gameState.attempts + 1;
      setGameState(prev => ({ ...prev, attempts: newAttempts }));

      if (cleanGuess.toLowerCase() === 'giveup') {
        printLine(`You gave up! The answer was: ${gameState.riddleData.answer}`, LineType.SYSTEM);
        setGameState({ mode: GameMode.IDLE, attempts: 0 });
        return;
      }

      if (cleanGuess.toLowerCase() === 'hint') {
         printLine(`HINT: ${gameState.riddleData.hint}`, LineType.AI);
         return;
      }

      // Simple string matching (case insensitive)
      if (cleanGuess.toLowerCase().includes(gameState.riddleData.answer.toLowerCase())) {
        printLine(`CORRECT! The answer is indeed '${gameState.riddleData.answer}'.`, LineType.SUCCESS);
        printLine(`Solved in ${newAttempts} attempts.`, LineType.SUCCESS);
        setGameState({ mode: GameMode.IDLE, attempts: 0 });
      } else {
        printLine(`Incorrect. Try again.`, LineType.ERROR);
      }
      return;
    }
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    
    const cmd = input;
    setInput('');
    printLine(cmd, LineType.INPUT);

    if (gameState.mode === GameMode.IDLE) {
      handleCommand(cmd);
    } else {
      handleGameInput(cmd);
    }
  };

  return (
    <div className="w-full h-screen bg-terminal-bg text-terminal-text font-mono flex flex-col relative overflow-hidden">
      {/* CRT Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
      
      {/* Main Terminal Container */}
      <div className="relative z-0 flex flex-col h-full max-w-4xl mx-auto w-full border-x border-terminal-dim shadow-[0_0_20px_rgba(51,255,51,0.1)]">
        
        {/* Header */}
        <header className="bg-terminal-dim/30 p-2 text-xs md:text-sm flex justify-between items-center border-b border-terminal-dim text-terminal-text/60">
           <span>NEUROTERM v1.0.4 [STABLE]</span>
           <span>STATUS: {gameState.mode === GameMode.IDLE ? 'IDLE' : 'ACTIVE_PROCESS'}</span>
        </header>

        {/* Output Area */}
        <TerminalOutput lines={history} />

        {/* Input Area */}
        <TerminalInput 
          value={input} 
          onChange={setInput} 
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          prefix={gameState.mode === GameMode.IDLE ? '> ' : '? '}
        />
      </div>
    </div>
  );
}
