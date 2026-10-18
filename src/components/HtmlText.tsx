import React from "react";
import { Text, type TextStyle } from "react-native";

// Lightweight renderer for the small HTML subset used in job descriptions:
// p, div, br, strong/b, em/i, ul/ol/li, h1-h4. Everything else is stripped
// but its text content is kept. No extra dependencies.

type Node =
  | { type: "text"; text: string }
  | { type: "el"; tag: string; children: Node[] };

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function parseHtml(html: string): Node[] {
  const clean = html.replace(/>\s+</g, "><");
  const root: Node[] = [];
  const stack: Node[][] = [root];
  const tagRe = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const push = (n: Node) => stack[stack.length - 1].push(n);
  while ((m = tagRe.exec(clean)) !== null) {
    const text = clean.slice(last, m.index);
    if (text) push({ type: "text", text: decodeEntities(text) });
    const full = m[0];
    const tag = m[1].toLowerCase();
    const closing = full.startsWith("</");
    const selfClosing =
      full.endsWith("/>") || tag === "br" || tag === "hr" || tag === "img";
    if (closing) {
      if (stack.length > 1) stack.pop();
    } else {
      const el: Node = { type: "el", tag, children: [] };
      push(el);
      if (!selfClosing) stack.push(el.children);
    }
    last = m.index + full.length;
  }
  const tail = clean.slice(last);
  if (tail) push({ type: "text", text: decodeEntities(tail) });
  return root;
}

interface RenderStyles {
  bold?: TextStyle;
  italic?: TextStyle;
}

function renderNodes(
  nodes: Node[],
  keyPrefix: string,
  styles: RenderStyles
): React.ReactNode {
  return nodes.map((n, i) => {
    const key = `${keyPrefix}-${i}`;
    if (n.type === "text") {
      const t = n.text.replace(/[ \t\r\n\f\v]+/g, " ");
      if (!t.trim()) return null;
      return <React.Fragment key={key}>{t}</React.Fragment>;
    }
    const kids = renderNodes(n.children, key, styles);
    switch (n.tag) {
      case "br":
        return <React.Fragment key={key}>{"\n"}</React.Fragment>;
      case "p":
      case "div":
      case "h1":
      case "h2":
      case "h3":
      case "h4":
        return (
          <React.Fragment key={key}>
            {"\n\n"}
            {kids}
          </React.Fragment>
        );
      case "strong":
      case "b":
        return (
          <Text key={key} style={styles.bold}>
            {kids}
          </Text>
        );
      case "em":
      case "i":
        return (
          <Text key={key} style={styles.italic}>
            {kids}
          </Text>
        );
      case "li":
        return (
          <React.Fragment key={key}>
            {"\n• "}
            {kids}
          </React.Fragment>
        );
      case "ul":
      case "ol":
        return (
          <React.Fragment key={key}>
            {"\n"}
            {kids}
            {"\n"}
          </React.Fragment>
        );
      default:
        return <React.Fragment key={key}>{kids}</React.Fragment>;
    }
  });
}

interface Props {
  html: string;
  style?: TextStyle;
  boldStyle?: TextStyle;
  italicStyle?: TextStyle;
}

export function HtmlText({ html, style, boldStyle, italicStyle }: Props) {
  const nodes = React.useMemo(() => parseHtml(html), [html]);
  const content = React.useMemo(
    () => renderNodes(nodes, "h", { bold: boldStyle, italic: italicStyle }),
    [nodes, boldStyle, italicStyle]
  );
  return <Text style={style}>{content}</Text>;
}
