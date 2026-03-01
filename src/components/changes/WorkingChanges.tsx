import { For, Show } from "solid-js";
import {
  changes,
  expandedFile,
  loadWorkingDiff,
  loadingChanges,
} from "../../stores/changes";
import { selectedPath } from "../../stores/projects";
import FileItem from "./FileItem";

function WorkingChanges() {
  return (
    <div class="working-changes">
      <Show
        when={!loadingChanges()}
        fallback={<div class="loading">Loading...</div>}
      >
        <Show
          when={changes().length > 0}
          fallback={<div class="empty-state">No working changes</div>}
        >
          <For each={changes()}>
            {(file) => (
              <FileItem
                file={file}
                expanded={expandedFile() === file.path}
                onClick={() => {
                  const path = selectedPath();
                  if (path) loadWorkingDiff(path, file.path);
                }}
              />
            )}
          </For>
        </Show>
      </Show>
    </div>
  );
}

export default WorkingChanges;
