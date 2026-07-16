"use client";

import ReactMarkdown from "react-markdown";

/**
 * Renders lesson content (markdown strings) with the academy design tokens.
 * Links open in a new tab safely. We do NOT render raw HTML (no `rehype-raw`)
 * to avoid injection from lesson content.
 */
export function LessonMarkdown({ content }: { content: string }) {
  const blocks = content.split("\n");
  return (
    <div className="markdown-body">
      {blocks.map((block, i) => (
        <ReactMarkdown
          key={i}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {block}
        </ReactMarkdown>
      ))}
    </div>
  );
}
