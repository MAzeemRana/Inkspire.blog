'use client'

import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  content: string
  className?: string
}

/** Styled markdown renderer for article bodies. */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn('article-body', className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="font-serif text-3xl md:text-4xl font-bold mt-10 mb-4 leading-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-serif text-2xl md:text-[1.7rem] font-bold mt-10 mb-3 leading-snug">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-xl md:text-2xl font-semibold mt-8 mb-2">{children}</h3>
          ),
          p: ({ children }) => <p className="text-foreground/90 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 text-foreground/90">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 text-foreground/90">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-5 py-1 my-6 text-lg font-serif italic text-foreground/80 bg-accent/40 rounded-r-lg">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-colors"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          code: ({ className: cls, children }) => {
            const isBlock = cls?.includes('language-')
            if (isBlock) {
              return (
                <code className="block font-mono text-sm bg-muted rounded-lg p-4 overflow-x-auto scrollbar-thin leading-relaxed">
                  {String(children).replace(/\n$/, '')}
                </code>
              )
            }
            return (
              <code className="font-mono text-[0.85em] bg-muted text-primary px-1.5 py-0.5 rounded">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="my-6">{children}</pre>,
          hr: () => <hr className="my-8 border-border" />,
          img: ({ src, alt }) => (
            <img src={src as string} alt={alt || ''} className="rounded-xl my-6 w-full object-cover" loading="lazy" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
