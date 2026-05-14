import type { ReactNode } from "react";

export default function BlogContent({ children }: { children: ReactNode }) {
  return (
    <div className="blog-content font-body text-black/80 leading-relaxed">
      {children}
      <style>{`
        .blog-content > * + * {
          margin-top: 24px;
        }
        .blog-content p {
          font-size: clamp(1rem, 1.4vw, 20px);
          line-height: 1.7;
          color: rgba(0, 0, 0, 0.8);
        }
        .blog-content h2 {
          font-family: var(--font-display, "Tungsten Narrow"), Impact, "Arial Narrow", sans-serif;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: #000;
          line-height: 1.05;
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          margin-top: 48px;
          margin-bottom: 16px;
        }
        .blog-content h3 {
          font-family: var(--font-body);
          font-weight: 700;
          color: #000;
          line-height: 1.25;
          font-size: clamp(1.25rem, 1.8vw, 1.5rem);
          margin-top: 32px;
          margin-bottom: 12px;
        }
        .blog-content ul,
        .blog-content ol {
          padding-left: 1.5rem;
          color: rgba(0, 0, 0, 0.8);
        }
        .blog-content ul { list-style: disc; }
        .blog-content ol { list-style: decimal; }
        .blog-content li + li {
          margin-top: 6px;
        }
        .blog-content li {
          font-size: clamp(1rem, 1.4vw, 20px);
          line-height: 1.65;
        }
        .blog-content a {
          color: var(--color-red, #F92524);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color 0.15s ease;
        }
        .blog-content a:hover {
          border-bottom-color: var(--color-red, #F92524);
        }
        .blog-content strong {
          font-weight: 700;
          color: #000;
        }
        .blog-content blockquote {
          border-left: 3px solid var(--color-red, #F92524);
          padding: 4px 0 4px 20px;
          margin: 8px 0;
          font-style: italic;
          color: rgba(0, 0, 0, 0.75);
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
          font-size: clamp(0.875rem, 1.2vw, 1rem);
        }
        .blog-content thead {
          background-color: #EFEEED;
        }
        .blog-content th {
          font-weight: 700;
          text-align: left;
          padding: 12px 14px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          color: #000;
        }
        .blog-content td {
          padding: 12px 14px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          vertical-align: top;
          color: rgba(0, 0, 0, 0.8);
        }
        .blog-content tbody tr:nth-child(even) td {
          background-color: rgba(239, 238, 237, 0.4);
        }
      `}</style>
    </div>
  );
}
