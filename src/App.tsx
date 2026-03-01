import { onMount, createEffect, on, onCleanup, Show } from "solid-js";
import ProjectList from "./components/sidebar/ProjectList";
import ChangePanel from "./components/changes/ChangePanel";
import {
  selectedPath,
  loadProjects,
  refreshProject,
} from "./stores/projects";
import {
  mode,
  loadWorkingChanges,
  loadCommitLog,
  resetChanges,
} from "./stores/changes";

function App() {
  let pollTimer: number | undefined;
  let polling = false;

  function clearPoll() {
    if (pollTimer !== undefined) {
      clearInterval(pollTimer);
      pollTimer = undefined;
    }
  }

  onMount(() => {
    loadProjects();
  });

  // React to project selection changes
  createEffect(
    on(selectedPath, (path, prevPath) => {
      if (path === prevPath) return;
      clearPoll();
      resetChanges();
      if (path) {
        startForPath(path);
      }
    })
  );

  // React to mode changes (only when a project is selected)
  createEffect(
    on(mode, () => {
      const path = selectedPath();
      if (!path) return;
      clearPoll();
      resetChanges();
      startForPath(path);
    }, { defer: true })
  );

  function startForPath(path: string) {
    if (mode() === "working") {
      polling = true;
      loadWorkingChanges(path).finally(() => {
        polling = false;
      });
      pollTimer = window.setInterval(async () => {
        if (polling) return;
        polling = true;
        try {
          await loadWorkingChanges(path, { silent: true });
          await refreshProject(path);
        } finally {
          polling = false;
        }
      }, 5000);
    } else {
      loadCommitLog(path);
    }
  }

  onCleanup(clearPoll);

  return (
    <div class="app">
      <aside class="sidebar">
        <ProjectList />
      </aside>
      <main class="main-panel">
        <Show
          when={selectedPath()}
          fallback={
            <div class="empty-state center">
              Select a project to view changes
            </div>
          }
        >
          <ChangePanel />
        </Show>
      </main>
    </div>
  );
}

export default App;
