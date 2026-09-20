import ReactMarkdown from "react-markdown";

// Renders an entry's markdown. react-markdown does not allow raw HTML, so this is safe to display.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-teal-700">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
