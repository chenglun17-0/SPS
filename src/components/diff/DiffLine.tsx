import { For } from "solid-js";
import type { DiffLine as DiffLineType } from "../../lib/types";
import { highlightLine, type DiffLanguage, type HighlightTokenType } from "../../lib/syntax";
import styles from "../../styles/diff.module.css";

interface Props {
  line: DiffLineType;
  language: DiffLanguage;
}

function DiffLine(props: Props) {
  const kindClass = () => {
    switch (props.line.kind) {
      case "Addition": return styles.addition;
      case "Deletion": return styles.deletion;
      default: return styles.context;
    }
  };

  const prefix = () => {
    switch (props.line.kind) {
      case "Addition": return "+";
      case "Deletion": return "-";
      default: return " ";
    }
  };

  const tokens = () => highlightLine(props.line.content, props.language);

  const tokenClass = (type: HighlightTokenType) => {
    switch (type) {
      case "keyword": return styles.tokenKeyword;
      case "string": return styles.tokenString;
      case "comment": return styles.tokenComment;
      case "number": return styles.tokenNumber;
      case "symbol": return styles.tokenSymbol;
      case "constant": return styles.tokenConstant;
      case "variable": return styles.tokenVariable;
      default: return "";
    }
  };

  return (
    <div class={`${styles.line} ${kindClass()}`}>
      <span class={styles.lineNo}>
        {props.line.old_lineno ?? ""}
      </span>
      <span class={styles.lineNo}>
        {props.line.new_lineno ?? ""}
      </span>
      <span class={styles.prefix}>{prefix()}</span>
      <span class={styles.content}>
        <For each={tokens()}>
          {(token) => (
            <span class={tokenClass(token.type)}>
              {token.text}
            </span>
          )}
        </For>
      </span>
    </div>
  );
}

export default DiffLine;
