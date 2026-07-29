import React from 'react';
import Editor from '@monaco-editor/react';

export default function MonacoEditorWrapper({ language = 'javascript', value = '', onChange, readOnly = false }) {
  const getMonacoLanguage = (lang) => {
    switch (lang.toLowerCase()) {
      case 'cpp':
      case 'c++':
        return 'cpp';
      case 'python':
      case 'py':
      case 'python3':
        return 'python';
      case 'java':
        return 'java';
      case 'javascript':
      case 'js':
      default:
        return 'javascript';
    }
  };

  return (
    <div className="w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-[#fffffe]">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={value}
        onChange={onChange}
        theme="vs"
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          readOnly: readOnly,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          renderLineHighlight: 'all',
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
}
