import { LanguageLogo, type LogoName } from "@/components/language-logo";

const FILES: { logo: LogoName; name: string; what: string }[] = [
  { logo: "json", name: "act-one.graph.json", what: "a board" },
  { logo: "markdown", name: "en.md", what: "a passage, per language" },
  { logo: "python", name: "weather.py", what: "a script" },
  { logo: "git", name: ".git", what: "your repository" },
];

/**
 * What is in a project folder, by the formats everybody already reads: each
 * file kind beside the mark of the format it is written in.
 */
export function Formats() {
  return (
    <ul className="grid grid-cols-2 gap-3 font-ui">
      {FILES.map((file) => (
        <li
          key={file.name}
          className="flex items-center gap-3 rounded-[12px] border border-border bg-card px-4 py-3"
        >
          <LanguageLogo name={file.logo} size={22} decorative />
          <div className="min-w-0">
            <p className="truncate font-code text-[13px]">{file.name}</p>
            <p className="text-xs text-muted-foreground">{file.what}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
