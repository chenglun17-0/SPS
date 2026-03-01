export interface ProjectInfo {
  path: string;
  name: string;
  branch: string;
  changed_files: number;
  is_worktree: boolean;
}

export interface FileChange {
  path: string;
  status: FileStatus;
  additions: number;
  deletions: number;
}

export type FileStatus = "Modified" | "Added" | "Deleted" | "Renamed" | "Untracked";

export interface FileDiff {
  path: string;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface DiffLine {
  kind: LineKind;
  content: string;
  old_lineno: number | null;
  new_lineno: number | null;
}

export type LineKind = "Context" | "Addition" | "Deletion";

export interface CommitInfo {
  id: string;
  message: string;
  author: string;
  time: number;
}
