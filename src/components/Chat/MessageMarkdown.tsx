import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

const MarkdownMessage = memo(function MarkdownMessage({
  content,
}: {
  content: string;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        code(props) {
          const { children, className, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match && !String(children).includes("\n");

          return isInline ? (
            <code
              className="bg-foreground/10 px-1.5 py-0.5 rounded-md text-xs font-mono"
              {...rest}
            >
              {children}
            </code>
          ) : (
            <div className="relative my-3 rounded-lg overflow-hidden border bg-zinc-950 dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center px-4 py-1.5 bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                {match ? match[1] : "Code"}
              </div>
              <pre className="p-4 overflow-x-auto text-[13px] text-zinc-50 font-mono leading-relaxed">
                <code className={className} {...rest}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

export default MarkdownMessage;
