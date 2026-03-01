use std::path::Path;

use crate::error::SpsError;
use crate::types::ProjectInfo;

const SKIP_DIRS: &[&str] = &[
    "node_modules",
    "target",
    ".git",
    "vendor",
    "dist",
    "build",
    ".next",
];

pub fn scan_directory(path: &str, max_depth: usize) -> Result<Vec<ProjectInfo>, SpsError> {
    let mut results = Vec::new();
    scan_recursive(Path::new(path), 0, max_depth, &mut results);
    Ok(results)
}

fn scan_recursive(
    dir: &Path,
    depth: usize,
    max_depth: usize,
    results: &mut Vec<ProjectInfo>,
) {
    if depth > max_depth {
        return;
    }

    // .git can be a directory (normal repo) or a file (worktree)
    let git_path = dir.join(".git");
    if git_path.is_dir() || git_path.is_file() {
        if let Ok(info) = crate::git::repo::get_project_info(&dir.to_string_lossy()) {
            results.push(info);
        }
        return;
    }

    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let name = path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        if SKIP_DIRS.contains(&name.as_str()) || name.starts_with('.') {
            continue;
        }

        scan_recursive(&path, depth + 1, max_depth, results);
    }
}
