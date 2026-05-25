'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import CodeEditor to avoid SSR issues with Ace Editor
const CodeEditor = dynamic(() => import('./CodeEditor'), {
  ssr: false,
});

interface AceEditorWrapperProps {
  code: string;
  language: string;
  theme: 'light' | 'dark';
  onChange: (value: string) => void;
}

const AceEditorWrapper: React.FC<AceEditorWrapperProps> = ({
  code,
  language,
  theme,
  onChange,
}) => {
  // Map language names to Ace Editor mode names
  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    python: 'python',
    cpp: 'c_cpp',
    c_cpp: 'c_cpp',
    c: 'c_cpp',
    csharp: 'csharp',
    java: 'java',
    typescript: 'typescript',
    ruby: 'ruby',
    golang: 'golang',
    php: 'php',
    swift: 'swift',
    kotlin: 'kotlin',
    rust: 'rust',
    scala: 'scala',
    perl: 'perl',
    r: 'r',
    haskell: 'haskell',
    lua: 'lua',
    dart: 'dart',
    elixir: 'elixir',
    clojure: 'clojure',
    fsharp: 'fsharp',
    groovy: 'groovy',
    objectivec: 'objectivec',
    pascal: 'pascal',
    fortran: 'fortran',
    assembly_x86: 'assembly_x86',
    cobol: 'cobol',
    lisp: 'lisp',
    d: 'd',
    erlang: 'erlang',
    ocaml: 'ocaml',
    prolog: 'prolog',
    sql: 'sql',
    vbscript: 'vbscript',
  };

  // Map theme to Ace Editor theme names
  const themeMap = {
    dark: 'monokai',
    light: 'github',
  };

  const aceLanguage = languageMap[language] || 'javascript';
  const aceTheme = themeMap[theme];

  return (
    <div className={`h-full w-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <CodeEditor
        language={aceLanguage}
        theme={aceTheme}
        value={code}
        onChange={onChange}
      />
    </div>
  );
};

export default AceEditorWrapper;
