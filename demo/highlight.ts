export type HighlightLang = "typescript" | "bash" | "html";

import type { FrameworkId } from "./snippets.js";

type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "fn"
  | "property"
  | "tag"
  | "attr"
  | "decorator";

interface Token {
  kind: TokenKind;
  text: string;
}

interface Rule {
  kind: TokenKind;
  re: RegExp;
}

const TS_KEYWORDS =
	"import|export|from|const|let|var|return|function|type|interface|class|extends|implements|new|if|else|for|while|do|switch|case|break|continue|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|null|undefined|true|false|this|super|as|declare|readonly|private|public|protected|static|get|set|enum|namespace|module|useEffect|useRef|useTemplateRef|shallowRef|watch|createEffect|onMount|onCleanup|onMounted|onUnmounted|onDestroy|Component|Input|OnInit|OnChanges|OnDestroy|ngOnInit|ngOnChanges|ngOnDestroy|defineProps|viewChild|ElementRef|bind:this";

const PRIMARY_RULES: Rule[] = [
  { kind: "string", re: /^`(?:\\[\s\S]|[^\\`])*`|^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'/ },
  { kind: "comment", re: /^\/\/[^\n]*/ },
  { kind: "comment", re: /^\/\*[\s\S]*?\*\// },
];

const TS_RULES: Rule[] = [
  { kind: "decorator", re: /^@[\w]+/ },
  { kind: "number", re: /^\d+(?:\.\d+)?/ },
  { kind: "keyword", re: new RegExp(`^(?:${TS_KEYWORDS})\\b`) },
  { kind: "fn", re: /^[a-zA-Z_$][\w$]*(?=\s*\()/ },
  { kind: "property", re: /^[a-zA-Z_$][\w$]*(?=\s*:)/ },
];

const HTML_RULES: Rule[] = [
  { kind: "tag", re: /^<\/?[\w-]+/ },
  { kind: "attr", re: /^[\w-]+(?==)/ },
  ...TS_RULES,
];

const BASH_RULES: Rule[] = [
  { kind: "keyword", re: /^(?:pnpm|npm|yarn)\b/ },
  { kind: "keyword", re: /^(?:add|install)\b/ },
  { kind: "string", re: /^buy-me-a-coffee-cta\b/ },
];

function matchAtStart(text: string, re: RegExp): RegExpMatchArray | null {
  return text.match(re);
}

function findNextRuleMatch(source: string, pos: number, rules: Rule[]): number {
  for (let index = pos + 1; index <= source.length; index += 1) {
    for (const rule of rules) {
      if (matchAtStart(source.slice(index), rule.re)) {
        return index;
      }
    }
  }
  return source.length;
}

function scan(source: string, rules: Rule[]): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < source.length) {
    let matched = false;
    for (const rule of rules) {
      const match = matchAtStart(source.slice(pos), rule.re);
      if (match?.index === 0) {
        tokens.push({ kind: rule.kind, text: match[0] });
        pos += match[0].length;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    const nextPos = findNextRuleMatch(source, pos, rules);
    tokens.push({ kind: "plain", text: source.slice(pos, nextPos) });
    pos = nextPos;
  }

  return tokens;
}

function refinePlain(tokens: Token[], rules: Rule[]): Token[] {
  const refined: Token[] = [];
  for (const token of tokens) {
    if (token.kind !== "plain") {
      refined.push(token);
      continue;
    }
    refined.push(...scan(token.text, rules));
  }
  return refined;
}

function tokenize(source: string, lang: HighlightLang): Token[] {
  const primary = scan(source, PRIMARY_RULES);
  switch (lang) {
    case "bash":
      return refinePlain([{ kind: "plain", text: source }], BASH_RULES);
    case "html":
      return refinePlain(primary, HTML_RULES);
    default:
      return refinePlain(primary, TS_RULES);
  }
}

function renderTokens(container: HTMLElement, tokens: Token[]): void {
  const fragment = document.createDocumentFragment();
  for (const token of tokens) {
    if (token.kind === "plain") {
      fragment.appendChild(document.createTextNode(token.text));
      continue;
    }
    const span = document.createElement("span");
    span.className = `tok-${token.kind}`;
    span.textContent = token.text;
    fragment.appendChild(span);
  }
  container.replaceChildren(fragment);
}

export function inferLangFromSource(source: string): HighlightLang {
  const trimmed = source.trimStart();
  if (/^(pnpm|npm|yarn)\b/.test(trimmed)) return "bash";
  if (trimmed.startsWith("<")) return "html";
  return "typescript";
}

export function inferFrameworkLang(framework: FrameworkId): HighlightLang {
  switch (framework) {
    case "vue":
    case "svelte":
      return "html";
    default:
      return "typescript";
  }
}

export function setHighlightedCode(
  element: HTMLElement,
  source: string,
  lang: HighlightLang = "typescript",
): void {
  element.dataset.code = source;
  renderTokens(element, tokenize(source, lang));

  const pre = element.tagName === "CODE" ? element.closest("pre") : element;
  if (pre instanceof HTMLElement) {
    pre.dataset.code = source;
  }
}

export function getCodeText(element: HTMLElement): string {
  return element.dataset.code ?? element.textContent ?? "";
}

export function highlightAll(root: ParentNode = document): void {
  for (const code of root.querySelectorAll("pre > code")) {
    if (!(code instanceof HTMLElement)) continue;
    const source = code.textContent ?? "";
    const lang =
      (code.closest("pre")?.dataset.lang as HighlightLang | undefined) ??
      inferLangFromSource(source);
    setHighlightedCode(code, source, lang);
  }
}
