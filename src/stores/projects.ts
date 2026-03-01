import { createSignal } from "solid-js";
import type { ProjectInfo } from "../lib/types";
import { api } from "../lib/tauri";

const [projects, setProjects] = createSignal<ProjectInfo[]>([]);
const [selectedPath, setSelectedPath] = createSignal<string | null>(null);
const [loading, setLoading] = createSignal(false);

async function loadProjects() {
  setLoading(true);
  try {
    const list = await api.listProjects();
    setProjects(list);
  } catch (e) {
    console.error("Failed to load projects:", e);
  } finally {
    setLoading(false);
  }
}

async function addProject(path: string) {
  try {
    const info = await api.addProject(path);
    setProjects((prev) => [...prev, info]);
    setSelectedPath(info.path);
  } catch (e) {
    console.error("Failed to add project:", e);
  }
}

async function scanAndAdd(path: string) {
  try {
    const found = await api.scanDirectory(path);
    for (const p of found) {
      await api.addProject(p.path);
    }
    await loadProjects();
    if (found.length > 0) {
      setSelectedPath(found[0].path);
    }
  } catch (e) {
    console.error("Failed to scan:", e);
  }
}

async function removeProject(path: string) {
  try {
    await api.removeProject(path);
    setProjects((prev) => prev.filter((p) => p.path !== path));
    if (selectedPath() === path) {
      setSelectedPath(null);
    }
  } catch (e) {
    console.error("Failed to remove:", e);
  }
}

async function refreshProject(path: string) {
  try {
    const info = await api.refreshProject(path);
    setProjects((prev) => prev.map((p) => (p.path === path ? info : p)));
  } catch (e) {
    console.error("Failed to refresh:", e);
  }
}

export {
  projects,
  selectedPath,
  loading,
  setSelectedPath,
  loadProjects,
  addProject,
  scanAndAdd,
  removeProject,
  refreshProject,
};
