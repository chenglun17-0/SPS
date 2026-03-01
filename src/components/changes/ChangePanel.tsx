import { Show } from "solid-js";
import { mode, diff, expandedFile, loadingDiff } from "../../stores/changes";
import ModeToggle from "./ModeToggle";
import WorkingChanges from "./WorkingChanges";
import CommitHistory from "./CommitHistory";
import DiffView from "../diff/DiffView";

function ChangePanel() {
  return (
    <div class="change-panel">
      <ModeToggle />
      <div class="change-layout">
        <section class="changes-list-pane">
          <div class="pane-title">{mode() === "working" ? "Modified Files" : "Commits & Files"}</div>
          <div class="changes-list-scroll">
            <Show when={mode() === "working"} fallback={<CommitHistory />}>
              <WorkingChanges />
            </Show>
          </div>
        </section>
        <section class="detail-pane">
          <div class="pane-title">File Detail</div>
          <div class="detail-scroll">
            <Show when={!loadingDiff()} fallback={<div class="loading">Loading diff...</div>}>
              <Show when={expandedFile() && diff()} fallback={<div class="empty-state">Select a file to view details</div>}>
                <DiffView diff={diff()!} />
              </Show>
            </Show>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChangePanel;
