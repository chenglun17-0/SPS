export type DiffLanguage = "plain" | "ruby";

export type HighlightTokenType =
  | "plain"
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "symbol"
  | "constant"
  | "variable";

export interface HighlightToken {
  type: HighlightTokenType;
  text: string;
}

const RUBY_KEYWORDS = new Set([
  "BEGIN",
  "END",
  "alias",
  "and",
  "begin",
  "break",
  "case",
  "class",
  "def",
  "defined?",
  "do",
  "else",
  "elsif",
  "end",
  "ensure",
  "false",
  "for",
  "if",
  "in",
  "module",
  "next",
  "nil",
  "not",
  "or",
  "redo",
  "rescue",
  "retry",
  "return",
  "self",
  "super",
  "then",
  "true",
  "undef",
  "unless",
  "until",
  "when",
  "while",
  "yield",
]);

function isIdentifierStart(ch: string) {
  return /[A-Za-z_]/.test(ch);
}

function isIdentifierPart(ch: string) {
  return /[A-Za-z0-9_]/.test(ch);
}

function pushToken(tokens: HighlightToken[], type: HighlightTokenType, text: string) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (type === "plain" && last?.type === "plain") {
    last.text += text;
    return;
  }
  tokens.push({ type, text });
}

function readIdentifier(input: string, start: number) {
  let end = start;
  while (end < input.length && isIdentifierPart(input[end])) {
    end += 1;
  }
  if (end < input.length && /[!?]/.test(input[end])) {
    end += 1;
  }
  return end;
}

function tokenizeRuby(input: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === "#") {
      pushToken(tokens, "comment", input.slice(i));
      break;
    }

    if (ch === "'" || ch === "\"" || ch === "`") {
      const quote = ch;
      let end = i + 1;
      while (end < input.length) {
        const cur = input[end];
        if (cur === "\\") {
          end += 2;
          continue;
        }
        end += 1;
        if (cur === quote) break;
      }
      pushToken(tokens, "string", input.slice(i, end));
      i = end;
      continue;
    }

    if (
      ch === ":" &&
      input[i - 1] !== ":" &&
      i + 1 < input.length &&
      isIdentifierStart(input[i + 1])
    ) {
      const end = readIdentifier(input, i + 1);
      pushToken(tokens, "symbol", input.slice(i, end));
      i = end;
      continue;
    }

    if (ch === "@" || ch === "$") {
      let start = i;
      i += 1;
      if (ch === "@" && input[i] === "@") i += 1;
      if (ch === "$" && /[0-9]/.test(input[i] ?? "")) {
        let end = i + 1;
        while (end < input.length && /[0-9]/.test(input[end])) end += 1;
        pushToken(tokens, "variable", input.slice(start, end));
        i = end;
      } else if (
        ch === "$" &&
        input[i] === "-" &&
        /[A-Za-z_]/.test(input[i + 1] ?? "")
      ) {
        const end = i + 2;
        pushToken(tokens, "variable", input.slice(start, end));
        i = end;
      } else if (ch === "$" && /[?:!~&'`"+\-*/\\,.;<>=]/.test(input[i] ?? "")) {
        const end = i + 1;
        pushToken(tokens, "variable", input.slice(start, end));
        i = end;
      } else if (i < input.length && isIdentifierStart(input[i])) {
        const end = readIdentifier(input, i);
        pushToken(tokens, "variable", input.slice(start, end));
        i = end;
      } else {
        pushToken(tokens, "plain", input.slice(start, i));
      }
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let end = i + 1;
      while (end < input.length && /[0-9]/.test(input[end])) end += 1;
      if (input[end] === "." && /[0-9]/.test(input[end + 1] ?? "")) {
        end += 1;
        while (end < input.length && /[0-9]/.test(input[end])) end += 1;
      }
      pushToken(tokens, "number", input.slice(i, end));
      i = end;
      continue;
    }

    if (isIdentifierStart(ch)) {
      const end = readIdentifier(input, i);
      const word = input.slice(i, end);
      if (RUBY_KEYWORDS.has(word)) {
        pushToken(tokens, "keyword", word);
      } else if (/[A-Z]/.test(word[0])) {
        pushToken(tokens, "constant", word);
      } else {
        pushToken(tokens, "plain", word);
      }
      i = end;
      continue;
    }

    pushToken(tokens, "plain", ch);
    i += 1;
  }

  return tokens;
}

export function detectDiffLanguage(filePath: string): DiffLanguage {
  const name = filePath.split("/").pop() ?? filePath;
  const lower = name.toLowerCase();
  if (
    lower.endsWith(".rb") ||
    lower.endsWith(".rake") ||
    lower.endsWith(".gemspec") ||
    lower.endsWith(".ru") ||
    lower === "gemfile" ||
    lower === "rakefile" ||
    lower === "config.ru"
  ) {
    return "ruby";
  }
  return "plain";
}

export function highlightLine(content: string, language: DiffLanguage): HighlightToken[] {
  if (content.length > 800) {
    return [{ type: "plain", text: content }];
  }
  if (language === "ruby") {
    return tokenizeRuby(content);
  }
  return [{ type: "plain", text: content }];
}
