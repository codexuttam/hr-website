import React, { useEffect } from "react";
import AceEditor from "react-ace";

// Import ace config
import "ace-builds/src-noconflict/ace";

// Import common modes
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-swift";
import "ace-builds/src-noconflict/mode-kotlin";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-scala";
import "ace-builds/src-noconflict/mode-perl";
import "ace-builds/src-noconflict/mode-r";
import "ace-builds/src-noconflict/mode-haskell";
import "ace-builds/src-noconflict/mode-lua";
import "ace-builds/src-noconflict/mode-dart";
import "ace-builds/src-noconflict/mode-elixir";
import "ace-builds/src-noconflict/mode-clojure";
import "ace-builds/src-noconflict/mode-fsharp";
import "ace-builds/src-noconflict/mode-groovy";
import "ace-builds/src-noconflict/mode-objectivec";
import "ace-builds/src-noconflict/mode-pascal";
import "ace-builds/src-noconflict/mode-fortran";
import "ace-builds/src-noconflict/mode-assembly_x86";
import "ace-builds/src-noconflict/mode-cobol";
import "ace-builds/src-noconflict/mode-lisp";
import "ace-builds/src-noconflict/mode-d";
import "ace-builds/src-noconflict/mode-erlang";
import "ace-builds/src-noconflict/mode-ocaml";
import "ace-builds/src-noconflict/mode-prolog";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-vbscript";

// Import themes
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";

// Import extensions
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";

interface CodeEditorProps {
  language: string;
  theme: string;
  value: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  theme,
  value,
  onChange,
}) => {
  useEffect(() => {
    // Ensure ace is properly configured
    const ace = require("ace-builds/src-noconflict/ace");
    ace.config.set("basePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-noconflict/");
    ace.config.set("modePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-noconflict/");
    ace.config.set("themePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-noconflict/");
    ace.config.set("workerPath", "https://cdn.jsdelivr.net/npm/ace-builds@1.32.0/src-noconflict/");
  }, []);

  return (
    <div className="h-full w-full">
      <AceEditor
        mode={language}
        theme={theme}
        name="dynamic-ace-editor"
        width="100%"
        height="100%"
        fontSize={14}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        value={value}
        onChange={onChange}
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={true}
        enableSnippets={true}
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          showLineNumbers: true,
          tabSize: 4,
          useSoftTabs: true,
          navigateWithinSoftTabs: true,
          enableAutoIndent: true,
          behavioursEnabled: true,
          wrapBehavioursEnabled: true,
          autoScrollEditorIntoView: true,
          highlightSelectedWord: true,
          showInvisibles: false,
          displayIndentGuides: true,
          fadeFoldWidgets: false,
          showFoldWidgets: true,
          showGutter: true,
          highlightGutterLine: true,
          fixedWidthGutter: false,
          printMargin: false,
        }}
      />
    </div>
  );
};

export default CodeEditor;
