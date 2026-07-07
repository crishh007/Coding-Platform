import { useEffect, useRef, useMemo } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, rectangularSelection, crosshairCursor } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, foldKeymap } from "@codemirror/language";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { oneDark } from "@codemirror/theme-one-dark";

const languageCompartment = new Compartment();

function getLanguageExtension(lang: string) {
  switch (lang) {
    case "c":
    case "cpp":   return cpp();
    case "python": return python();
    case "java":   return java();
    case "javascript": return javascript();
    case "rust":   return rust();
    case "go":     return go();
    default:       return cpp();
  }
}

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    background: "#0f111a",
  },
  ".cm-scroller": {
    overflow: "auto",
    height: "100%",
    fontFamily: "inherit",
  },
  ".cm-content": {
    caretColor: "#00ffcc",
    padding: "12px 0",
  },
  ".cm-cursor": {
    borderLeftColor: "#00ffcc",
    borderLeftWidth: "2px",
  },
  ".cm-line": {
    padding: "0 16px 0 4px",
  },
  ".cm-gutters": {
    background: "#0c0e17",
    borderRight: "1px solid #1e2130",
    color: "#3a3f5c",
    minWidth: "42px",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    paddingRight: "10px",
    paddingLeft: "4px",
  },
  ".cm-activeLineGutter": {
    background: "#171a2a",
    color: "#7a7fa8",
  },
  ".cm-activeLine": {
    background: "#171a2a66",
  },
  ".cm-selectionBackground, ::selection": {
    background: "#00ffcc22 !important",
  },
  ".cm-matchingBracket": {
    outline: "1px solid #00ffcc66",
    background: "#00ffcc11",
    borderRadius: "2px",
  },
  ".cm-foldGutter .cm-gutterElement": {
    paddingLeft: "2px",
  },
  ".cm-tooltip": {
    background: "#1e2130",
    border: "1px solid #2a2f4a",
    borderRadius: "6px",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#00ffcc22",
  },
}, { dark: true });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const extensions = useMemo(() => [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    history(),
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    crosshairCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    foldGutter(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([
      indentWithTab,
      ...defaultKeymap,
      ...historyKeymap,
      ...foldKeymap,
    ]),
    oneDark,
    editorTheme,
    languageCompartment.of(getLanguageExtension(language)),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    }),
    EditorView.lineWrapping,
  ], []);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: languageCompartment.reconfigure(getLanguageExtension(language)),
    });
  }, [language]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{ background: "#0f111a" }}
    />
  );
}
