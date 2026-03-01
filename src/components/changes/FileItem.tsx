import type { FileChange } from "../../lib/types";

interface Props {
  file: FileChange;
  expanded: boolean;
  onClick: () => void;
}

const STATUS_ICONS: Record<string, { label: string; color: string }> = {
  Modified: { label: "M", color: "var(--ctp-yellow)" },
  Added: { label: "A", color: "var(--ctp-green)" },
  Deleted: { label: "D", color: "var(--ctp-red)" },
  Renamed: { label: "R", color: "var(--ctp-blue)" },
  Untracked: { label: "?", color: "var(--ctp-overlay0)" },
};

function FileItem(props: Props) {
  const info = () => STATUS_ICONS[props.file.status] ?? STATUS_ICONS.Modified;

  return (
    <div
      class={`file-item ${props.expanded ? "expanded" : ""}`}
      onClick={props.onClick}
    >
      <span class="file-status" style={{ color: info().color }}>
        {info().label}
      </span>
      <span class="file-path">{props.file.path}</span>
      <span class="file-stats">
        {props.file.additions > 0 && (
          <span class="stat-add">+{props.file.additions}</span>
        )}
        {props.file.deletions > 0 && (
          <span class="stat-del">-{props.file.deletions}</span>
        )}
      </span>
      <span class="file-chevron">{props.expanded ? "▾" : "▸"}</span>
    </div>
  );
}

export default FileItem;
