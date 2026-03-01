import { For, Show } from "solid-js";
import {
  commits,
  loadingCommits,
  expandedCommit,
  commitFiles,
  expandedFile,
  loadCommitFiles,
  loadCommitDiff,
} from "../../stores/changes";
import { selectedPath } from "../../stores/projects";
import FileItem from "./FileItem";

function CommitHistory() {
  function formatTime(ts: number) {
    return new Date(ts * 1000).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div class="commit-history">
      <Show
        when={!loadingCommits()}
        fallback={<div class="loading">Loading commits...</div>}
      >
        <Show when={commits().length > 0} fallback={<div class="empty-state">No commits</div>}>
          <For each={commits()}>
            {(commit) => (
              <div class="commit-group">
                <div
                  class={`commit-item ${expandedCommit() === commit.id ? "expanded" : ""}`}
                  onClick={() => {
                    const path = selectedPath();
                    if (path) loadCommitFiles(path, commit.id);
                  }}
                >
                  <span class="commit-sha">{commit.id.slice(0, 7)}</span>
                  <span class="commit-msg">{commit.message}</span>
                  <span class="commit-meta">
                    {commit.author} · {formatTime(commit.time)}
                  </span>
                </div>
                <Show when={expandedCommit() === commit.id}>
                  <div class="commit-files">
                    <For each={commitFiles()}>
                      {(file) => (
                        <FileItem
                          file={file}
                          expanded={expandedFile() === file.path}
                          onClick={() => {
                            const rp = selectedPath();
                            if (rp) loadCommitDiff(rp, commit.id, file.path);
                          }}
                        />
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </Show>
      </Show>
    </div>
  );
}

export default CommitHistory;
