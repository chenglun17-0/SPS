import { For, Show } from "solid-js";
import type { FileDiff } from "../../lib/types";
import { detectDiffLanguage } from "../../lib/syntax";
import DiffHunk from "./DiffHunk";
import styles from "../../styles/diff.module.css";

interface Props {
  diff: FileDiff;
}

function DiffView(props: Props) {
  const language = () => detectDiffLanguage(props.diff.path);

  return (
    <div class={styles.diffView}>
      <Show when={props.diff.hunks.length > 0} fallback={<div class={styles.noDiff}>No diff available</div>}>
        <div class={styles.diffBody}>
          <div class={styles.diffContent}>
            <For each={props.diff.hunks}>
              {(hunk) => <DiffHunk hunk={hunk} language={language()} />}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default DiffView;
