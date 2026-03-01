import { createSignal } from "solid-js";
import type { FileChange, FileDiff, CommitInfo } from "../lib/types";
import { api } from "../lib/tauri";

export type ViewMode = "working" | "history";

const [mode, setMode] = createSignal<ViewMode>("working");
const [changes, setChanges] = createSignal<FileChange[]>([]);
const [commits, setCommits] = createSignal<CommitInfo[]>([]);
const [expandedFile, setExpandedFile] = createSignal<string | null>(null);
const [expandedCommit, setExpandedCommit] = createSignal<string | null>(null);
const [commitFiles, setCommitFiles] = createSignal<FileChange[]>([]);
const [diff, setDiff] = createSignal<FileDiff | null>(null);
const [loadingChanges, setLoadingChanges] = createSignal(false);
const [loadingDiff, setLoadingDiff] = createSignal(false);
const [loadingCommits, setLoadingCommits] = createSignal(false);

// Version counter to discard stale async results
let requestVersion = 0;
let detailRequestVersion = 0;

interface LoadWorkingChangesOptions {
  silent?: boolean;
}

function normalizeWorkingChanges(list: FileChange[]) {
  return [...list].sort((a, b) => {
    const pathCmp = a.path.localeCompare(b.path);
    if (pathCmp !== 0) return pathCmp;
    return a.status.localeCompare(b.status);
  });
}

function isSameWorkingChanges(prev: FileChange[], next: FileChange[]) {
  if (prev.length !== next.length) return false;
  for (let i = 0; i < prev.length; i += 1) {
    const a = prev[i];
    const b = next[i];
    if (!b) return false;
    if (a.path !== b.path) return false;
    if (a.status !== b.status) return false;
    if (a.additions !== b.additions) return false;
    if (a.deletions !== b.deletions) return false;
  }
  return true;
}

async function loadWorkingChanges(repoPath: string, options: LoadWorkingChangesOptions = {}) {
  const ver = ++requestVersion;
  const silent = options.silent === true;
  if (!silent) setLoadingChanges(true);
  try {
    const list = await api.getWorkingChanges(repoPath);
    if (ver !== requestVersion) return;
    const normalized = normalizeWorkingChanges(list);
    const currentExpanded = expandedFile();
    if (currentExpanded && !normalized.some((item) => item.path === currentExpanded)) {
      detailRequestVersion++;
      setExpandedFile(null);
      setDiff(null);
      setLoadingDiff(false);
    }
    if (!isSameWorkingChanges(changes(), normalized)) {
      setChanges(normalized);
    }
  } catch (e) {
    if (ver !== requestVersion) return;
    console.error("Failed to load changes:", e);
    if (!silent) {
      setChanges([]);
    }
  } finally {
    if (!silent && ver === requestVersion) setLoadingChanges(false);
  }
}

async function loadWorkingDiff(repoPath: string, filePath: string) {
  if (expandedFile() === filePath) {
    detailRequestVersion++;
    setExpandedFile(null);
    setDiff(null);
    setLoadingDiff(false);
    return;
  }
  const ver = ++detailRequestVersion;
  setLoadingDiff(true);
  try {
    const d = await api.getWorkingDiff(repoPath, filePath);
    if (ver !== detailRequestVersion) return;
    setDiff(d);
    setExpandedFile(filePath);
  } catch (e) {
    if (ver !== detailRequestVersion) return;
    console.error("Failed to load diff:", e);
  } finally {
    if (ver === detailRequestVersion) setLoadingDiff(false);
  }
}

async function loadCommitLog(repoPath: string) {
  const ver = ++requestVersion;
  setLoadingCommits(true);
  try {
    const log = await api.getCommitLog(repoPath, 50);
    if (ver !== requestVersion) return;
    setCommits(log);
  } catch (e) {
    if (ver !== requestVersion) return;
    console.error("Failed to load commits:", e);
    setCommits([]);
  } finally {
    if (ver === requestVersion) setLoadingCommits(false);
  }
}

async function loadCommitFiles(repoPath: string, commitId: string) {
  if (expandedCommit() === commitId) {
    detailRequestVersion++;
    setExpandedCommit(null);
    setCommitFiles([]);
    setExpandedFile(null);
    setDiff(null);
    setLoadingDiff(false);
    return;
  }
  const ver = ++detailRequestVersion;
  setExpandedFile(null);
  setDiff(null);
  setLoadingDiff(false);
  try {
    const files = await api.getCommitFiles(repoPath, commitId);
    if (ver !== detailRequestVersion) return;
    setCommitFiles(files);
    setExpandedCommit(commitId);
  } catch (e) {
    if (ver !== detailRequestVersion) return;
    console.error("Failed to load commit files:", e);
  }
}

async function loadCommitDiff(repoPath: string, commitId: string, filePath: string) {
  if (expandedFile() === filePath) {
    detailRequestVersion++;
    setExpandedFile(null);
    setDiff(null);
    setLoadingDiff(false);
    return;
  }
  const ver = ++detailRequestVersion;
  setLoadingDiff(true);
  try {
    const d = await api.getCommitDiff(repoPath, commitId, filePath);
    if (ver !== detailRequestVersion) return;
    setDiff(d);
    setExpandedFile(filePath);
  } catch (e) {
    if (ver !== detailRequestVersion) return;
    console.error("Failed to load commit diff:", e);
  } finally {
    if (ver === detailRequestVersion) setLoadingDiff(false);
  }
}

function resetChanges() {
  requestVersion++;
  detailRequestVersion++;
  setChanges([]);
  setCommits([]);
  setCommitFiles([]);
  setExpandedFile(null);
  setExpandedCommit(null);
  setDiff(null);
  setLoadingChanges(false);
  setLoadingCommits(false);
  setLoadingDiff(false);
}

export {
  mode,
  setMode,
  changes,
  commits,
  expandedFile,
  expandedCommit,
  commitFiles,
  diff,
  loadingChanges,
  loadingCommits,
  loadingDiff,
  loadWorkingChanges,
  loadWorkingDiff,
  loadCommitLog,
  loadCommitFiles,
  loadCommitDiff,
  resetChanges,
};
