import { For } from "solid-js";
import type { DiffHunk as DiffHunkType } from "../../lib/types";
import type { DiffLanguage } from "../../lib/syntax";
import DiffLine from "./DiffLine";
import styles from "../../styles/diff.module.css";

interface Props {
  hunk: DiffHunkType;
  language: DiffLanguage;
}

function DiffHunk(props: Props) {
  return (
    <div class={styles.hunk}>
      <div class={styles.hunkHeader}>{props.hunk.header}</div>
      <For each={props.hunk.lines}>
        {(line) => <DiffLine line={line} language={props.language} />}
      </For>
    </div>
  );
}

export default DiffHunk;
