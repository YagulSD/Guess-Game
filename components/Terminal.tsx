import React, { useEffect, useRef } from 'react';
import { LineType, TerminalLine } from '../types';

interface TerminalOutputProps {
  lines: TerminalLine[];
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ lines }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const getLineColor = (type: LineType) => {
    switch (type) {
      case LineType.INPUT: return 'text-terminal-text';
      case LineType.OUTPUT: return 'text-gray-300';
      case LineType.ERROR: return 'text-terminal-alert';
      case LineType.SUCCESS: return 'text-terminal-blue';
      case LineType.SYSTEM: return 'text-terminal-warn';
      case LineType.AI: return 'text-purple-400';
      default: return 'text-terminal-text';
    }
  };

  const getPrefix = (type: LineType) => {
    switch (type) {
      case LineType.INPUT: return '> ';
      case LineType.AI: return 'AI@CORE: ';
      case LineType.SYSTEM: return 'SYS >> ';
      case LineType.ERROR: return 'ERR >> ';
      case LineType.SUCCESS: return 'OK >> ';
      default: return '';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm md:text-base">
      {lines.map((line) => (
        <div key={line.id} className={`${getLineColor(line.type)} break-words whitespace-pre-wrap`}>
          <span className="opacity-50 select-none">{getPrefix(line.type)}</span>
          <span className={line.type === LineType.AI ? "drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]" : ""}>
            {line.content}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

interface TerminalInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  prefix?: string;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  isProcessing,
  prefix = '> '
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on input
  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      onSubmit();
    }
  };

  return (
    <div className="p-4 pt-0 flex items-center font-mono text-terminal-text text-sm md:text-base relative">
      <span className="mr-2 opacity-80">{prefix}</span>
      <div className="flex-1 relative">
         {/* Visible Mock Input to style the cursor and text properly */}
        <span className="whitespace-pre-wrap break-all">{value}</span>
        {/* Blinking Block Cursor */}
        {!isProcessing && (
           <span className="inline-block w-2.5 h-5 bg-terminal-text ml-0.5 align-middle animate-blink shadow-[0_0_8px_rgba(51,255,51,0.8)]"></span>
        )}
        
        {/* Hidden Actual Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 opacity-0 cursor-default"
          autoFocus
          disabled={isProcessing}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
};
