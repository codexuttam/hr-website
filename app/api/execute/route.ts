import { NextRequest, NextResponse } from 'next/server';

// Piston API configuration
const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Language mapping for Piston
// Piston requires specific versions, but we can try to use the latest available if we don't specify, 
// or specify a version we know exists. 
// For now, we will map to language names and let Piston pick the version or use a known one.
const PISTON_LANGUAGE_MAP: Record<string, { language: string, version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  c: { language: 'c', version: '10.2.0' },
  c_cpp: { language: 'c++', version: '10.2.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  golang: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  php: { language: 'php', version: '8.2.3' },
  ruby: { language: 'ruby', version: '3.0.1' },
  swift: { language: 'swift', version: '5.3.3' },
  kotlin: { language: 'kotlin', version: '1.8.20' },
  scala: { language: 'scala', version: '3.2.2' },
  perl: { language: 'perl', version: '5.36.0' },
  r: { language: 'r', version: '4.2.3' },
  haskell: { language: 'haskell', version: '9.0.1' },
  lua: { language: 'lua', version: '5.4.4' },
  dart: { language: 'dart', version: '2.19.6' },
  elixir: { language: 'elixir', version: '1.11.3' },
  clojure: { language: 'clojure', version: '1.10.3' },
  fsharp: { language: 'fsharp', version: '5.0.201' },
  groovy: { language: 'groovy', version: '3.0.7' },
  objectivec: { language: 'objective-c', version: '10.2.0' }, // GCC
  pascal: { language: 'pascal', version: '3.2.2' },
  fortran: { language: 'fortran', version: '10.2.0' },
  assembly_x86: { language: 'nasm', version: '2.15.05' },
  cobol: { language: 'cobol', version: '3.1.2' },
  lisp: { language: 'lisp', version: '2.1.2' },
  d: { language: 'd', version: '10.2.0' },
  erlang: { language: 'erlang', version: '23.0.0' },
  ocaml: { language: 'ocaml', version: '4.12.0' },
  prolog: { language: 'prolog', version: '8.2.4' },
  sql: { language: 'sqlite3', version: '3.36.0' },
  vbscript: { language: 'vbnc', version: '0.0.0.5943' },
};

export async function POST(request: NextRequest) {
  try {
    const { code, language, customInput } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    let output = '';
    let error = '';

    try {
      const result = await executeWithPiston(code, language, customInput || '');
      output = result.output;
      error = result.error;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    return NextResponse.json({
      output: output || undefined,
      error: error || undefined,
    });
  } catch (err) {
    console.error('Execution error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Execute code using Piston API
async function executeWithPiston(
  code: string,
  language: string,
  stdin: string
): Promise<{ output: string; error: string }> {
  const langConfig = PISTON_LANGUAGE_MAP[language];
  
  if (!langConfig) {
    return { output: '', error: `Language ${language} is not supported` };
  }

  try {
    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            content: code,
          },
        ],
        stdin: stdin || '',
        run_timeout: 3000,
        compile_timeout: 10000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Piston response structure:
    // {
    //   "run": {
    //     "stdout": "...",
    //     "stderr": "...",
    //     "output": "...",
    //     "code": 0,
    //     "signal": null
    //   },
    //   "compile": { // optional
    //     "stdout": "...",
    //     "stderr": "...",
    //     "output": "...",
    //     "code": 0
    //   }
    // }

    if (result.compile && result.compile.code !== 0) {
      return { 
        output: '', 
        error: result.compile.output || result.compile.stderr || 'Compilation error' 
      };
    }

    if (result.run && result.run.code !== 0 && !result.run.stderr) {
       // Sometimes run code is not 0 but stderr is empty, it might be a runtime error captured in stdout or just exit code
       // But usually stderr has the info.
    }

    const output = result.run.stdout || '';
    const error = result.run.stderr || '';

    // If there is both output and error, we might want to return both, 
    // but the current interface expects split.
    // Piston 'output' field in 'run' combines stdout and stderr.
    
    return { output, error };
  } catch (err) {
    return { 
      output: '', 
      error: `Execution Error: ${err instanceof Error ? err.message : String(err)}` 
    };
  }
}



