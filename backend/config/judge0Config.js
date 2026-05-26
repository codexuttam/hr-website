// Judge0 CE public instance — no API key required
const JUDGE0_URL = process.env.JUDGE0_URL || 'https://ce.judge0.com';

// Language IDs: https://ce.judge0.com/languages
const LANGUAGE_MAP = {
  python:       { id: 71,  name: 'Python 3'          },
  javascript:   { id: 63,  name: 'JavaScript (Node)'  },
  java:         { id: 62,  name: 'Java'               },
  cpp:          { id: 54,  name: 'C++ (GCC)'          },
  c_cpp:        { id: 54,  name: 'C++ (GCC)'          },
  c:            { id: 50,  name: 'C (GCC)'            },
  csharp:       { id: 51,  name: 'C# (Mono)'          },
  golang:       { id: 60,  name: 'Go'                 },
  rust:         { id: 73,  name: 'Rust'               },
  ruby:         { id: 72,  name: 'Ruby'               },
  typescript:   { id: 74,  name: 'TypeScript'         },
  php:          { id: 68,  name: 'PHP'                },
  kotlin:       { id: 78,  name: 'Kotlin'             },
  swift:        { id: 83,  name: 'Swift'              },
  scala:        { id: 81,  name: 'Scala'              },
  r:            { id: 80,  name: 'R'                  },
  perl:         { id: 85,  name: 'Perl'               },
  lua:          { id: 64,  name: 'Lua'                },
  haskell:      { id: 61,  name: 'Haskell'            },
  dart:         { id: 90,  name: 'Dart'               },
  bash:         { id: 46,  name: 'Bash'               },
  sql:          { id: 82,  name: 'SQL'                },
  pascal:       { id: 67,  name: 'Pascal'             },
  elixir:       { id: 57,  name: 'Elixir'             },
  erlang:       { id: 58,  name: 'Erlang'             },
  ocaml:        { id: 65,  name: 'OCaml'              },
  clojure:      { id: 86,  name: 'Clojure'            },
  fsharp:       { id: 87,  name: 'F#'                 },
  d:            { id: 56,  name: 'D'                  },
  prolog:       { id: 69,  name: 'Prolog'             },
  cobol:        { id: 77,  name: 'COBOL'              },
  groovy:       { id: 88,  name: 'Groovy'             },
};

const RUN_TIMEOUT_MS = 5;       // Judge0 uses seconds, not ms
const MEMORY_LIMIT   = 128000;  // KB

module.exports = { JUDGE0_URL, LANGUAGE_MAP, RUN_TIMEOUT_MS, MEMORY_LIMIT };
