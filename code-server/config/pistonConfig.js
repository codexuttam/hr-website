// Try PISTON_API_URL from env, else fall back to the community mirror
const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';

// Optional API key (required by emkc.org — get one at https://emkc.org/api)
const PISTON_API_KEY = process.env.PISTON_API_KEY || '';

const LANGUAGE_MAP = {
  // ── Core languages ──────────────────────────────────────────────────────────
  javascript:   { language: 'javascript', version: '18.15.0', ext: 'js'   },
  typescript:   { language: 'typescript', version: '5.0.3',   ext: 'ts'   },
  python:       { language: 'python',     version: '3.10.0',  ext: 'py'   },
  java:         { language: 'java',       version: '15.0.2',  ext: 'java' },
  c:            { language: 'c',          version: '10.2.0',  ext: 'c'    },
  c_cpp:        { language: 'c++',        version: '10.2.0',  ext: 'cpp'  },
  cpp:          { language: 'c++',        version: '10.2.0',  ext: 'cpp'  },
  csharp:       { language: 'csharp',     version: '6.12.0',  ext: 'cs'   },
  golang:       { language: 'go',         version: '1.16.2',  ext: 'go'   },
  rust:         { language: 'rust',       version: '1.68.2',  ext: 'rs'   },
  php:          { language: 'php',        version: '8.2.3',   ext: 'php'  },
  ruby:         { language: 'ruby',       version: '3.0.1',   ext: 'rb'   },
  kotlin:       { language: 'kotlin',     version: '1.8.20',  ext: 'kt'   },
  scala:        { language: 'scala',      version: '3.2.2',   ext: 'scala'},
  swift:        { language: 'swift',      version: '5.3.3',   ext: 'swift'},
  // ── Extended languages ───────────────────────────────────────────────────────
  perl:         { language: 'perl',       version: '5.36.0',  ext: 'pl'   },
  r:            { language: 'r',          version: '4.2.3',   ext: 'r'    },
  haskell:      { language: 'haskell',    version: '9.0.1',   ext: 'hs'   },
  lua:          { language: 'lua',        version: '5.4.4',   ext: 'lua'  },
  dart:         { language: 'dart',       version: '2.19.6',  ext: 'dart' },
  elixir:       { language: 'elixir',     version: '1.11.3',  ext: 'exs'  },
  clojure:      { language: 'clojure',    version: '1.10.3',  ext: 'clj'  },
  fsharp:       { language: 'fsharp',     version: '5.0.201', ext: 'fs'   },
  groovy:       { language: 'groovy',     version: '3.0.7',   ext: 'groovy'},
  objectivec:   { language: 'objective-c',version: '10.2.0',  ext: 'm'    },
  pascal:       { language: 'pascal',     version: '3.2.2',   ext: 'pas'  },
  fortran:      { language: 'fortran',    version: '10.2.0',  ext: 'f90'  },
  assembly_x86: { language: 'nasm',       version: '2.15.05', ext: 'asm'  },
  cobol:        { language: 'cobol',      version: '3.1.2',   ext: 'cob'  },
  lisp:         { language: 'lisp',       version: '2.1.2',   ext: 'lisp' },
  d:            { language: 'd',          version: '10.2.0',  ext: 'd'    },
  erlang:       { language: 'erlang',     version: '23.0.0',  ext: 'erl'  },
  ocaml:        { language: 'ocaml',      version: '4.12.0',  ext: 'ml'   },
  prolog:       { language: 'prolog',     version: '8.2.4',   ext: 'pl'   },
  sql:          { language: 'sqlite3',    version: '3.36.0',  ext: 'sql'  },
  vbscript:     { language: 'vbnc',       version: '0.0.0.5943', ext: 'vb'},
};

const RUN_TIMEOUT_MS     = 5000;
const COMPILE_TIMEOUT_MS = 10000;

module.exports = { PISTON_API_URL, PISTON_API_KEY, LANGUAGE_MAP, RUN_TIMEOUT_MS, COMPILE_TIMEOUT_MS };