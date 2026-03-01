import { Show } from "solid-js";
import { mode, setMode, type ViewMode } from "../../stores/changes";

function ModeToggle() {
  function handleToggle(m: ViewMode) {
    setMode(m);
  }

  return (
    <div class="mode-toggle">
      <button
        classList={{ active: mode() === "working" }}
        onClick={() => handleToggle("working")}
      >
        Working Changes
      </button>
      <button
        classList={{ active: mode() === "history" }}
        onClick={() => handleToggle("history")}
      >
        History
      </button>
    </div>
  );
}

export default ModeToggle;
