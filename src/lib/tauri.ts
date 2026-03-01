import { invoke } from "@tauri-apps/api/core";
import type {
  ProjectInfo,
  FileChange,
  FileDiff,
  CommitInfo,
} from "./types";

export const api = {
  scanDirectory: (path: string) =>
    invoke<ProjectInfo[]>("scan_directory", { path }),

  addProject: (path: string) =>
    invoke<ProjectInfo>("add_project", { path }),

  removeProject: (path: string) =>
    invoke<void>("remove_project", { path }),

  listProjects: () =>
    invoke<ProjectInfo[]>("list_projects"),

  refreshProject: (path: string) =>
    invoke<ProjectInfo>("refresh_project", { path }),

  getWorkingChanges: (repoPath: string) =>
    invoke<FileChange[]>("get_working_changes", { repoPath }),

  getWorkingDiff: (repoPath: string, filePath: string) =>
    invoke<FileDiff>("get_working_diff", { repoPath, filePath }),

  getCommitLog: (repoPath: string, limit: number) =>
    invoke<CommitInfo[]>("get_commit_log", { repoPath, limit }),

  getCommitFiles: (repoPath: string, commitId: string) =>
    invoke<FileChange[]>("get_commit_files", { repoPath, commitId }),

  getCommitDiff: (repoPath: string, commitId: string, filePath: string) =>
    invoke<FileDiff>("get_commit_diff", { repoPath, commitId, filePath }),
};
