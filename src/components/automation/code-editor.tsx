"use client";

import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

export function CodeEditor({ value, language = "typescript" }: { value: string; language?: string }) {
  const { theme } = useTheme();

  return (
    <Editor
      height="440px"
      language={language}
      value={value}
      theme={theme === "dark" ? "vs-dark" : "light"}
      loading={<Loader2 className="size-5 animate-spin text-primary" />}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "var(--font-mono), monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: "none",
        scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
      }}
    />
  );
}
