import type { ProjectInfo } from "../../lib/types";
import styles from "../../styles/sidebar.module.css";

interface Props {
  project: ProjectInfo;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function ProjectItem(props: Props) {
  return (
    <div
      class={`${styles.item} ${props.active ? styles.active : ""}`}
      onClick={props.onSelect}
    >
      <div class={styles.itemInfo}>
        <div class={styles.itemName}>{props.project.name}</div>
        <div class={styles.itemMeta}>
          <span>{props.project.branch}</span>
          {props.project.is_worktree && (
            <span class={styles.worktreeTag}>worktree</span>
          )}
        </div>
      </div>
      {props.project.changed_files > 0 && (
        <span class={styles.badge}>{props.project.changed_files}</span>
      )}
      <button
        class={styles.removeBtn}
        onClick={(e) => {
          e.stopPropagation();
          props.onRemove();
        }}
        title="Remove project"
      >
        ×
      </button>
    </div>
  );
}

export default ProjectItem;
