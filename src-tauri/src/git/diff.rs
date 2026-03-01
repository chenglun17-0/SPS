use std::path::Path;

use git2::{DiffOptions, Oid, Repository};

use crate::error::SpsError;
use crate::types::{DiffHunk, DiffLine, FileChange, FileDiff, FileStatus, LineKind};

pub fn get_working_diff(repo: &Repository, file_path: &str) -> Result<FileDiff, SpsError> {
    let mut opts = DiffOptions::new();
    opts.pathspec(file_path)
        .include_untracked(true)
        .recurse_untracked_dirs(true);

    let diff = repo.diff_index_to_workdir(None, Some(&mut opts))?;
    let result = parse_diff(&diff, file_path)?;

    // If diff is empty, the file might be untracked — read it directly
    if result.hunks.is_empty() {
        let workdir = repo.workdir().ok_or_else(|| {
            SpsError::Custom("No workdir found".to_string())
        })?;
        let full_path = workdir.join(file_path);
        return read_file_as_addition(&full_path, file_path);
    }

    Ok(result)
}

pub fn get_commit_diff(
    repo: &Repository,
    commit_id: &str,
    file_path: &str,
) -> Result<FileDiff, SpsError> {
    let oid = Oid::from_str(commit_id)?;
    let commit = repo.find_commit(oid)?;
    let tree = commit.tree()?;

    let parent_tree = commit.parent(0).ok().and_then(|p| p.tree().ok());

    let mut opts = DiffOptions::new();
    opts.pathspec(file_path);

    let diff = repo.diff_tree_to_tree(
        parent_tree.as_ref(),
        Some(&tree),
        Some(&mut opts),
    )?;

    parse_diff(&diff, file_path)
}

pub fn get_commit_files(
    repo: &Repository,
    commit_id: &str,
) -> Result<Vec<FileChange>, SpsError> {
    let oid = Oid::from_str(commit_id)?;
    let commit = repo.find_commit(oid)?;
    let tree = commit.tree()?;

    let parent_tree = commit.parent(0).ok().and_then(|p| p.tree().ok());

    let diff = repo.diff_tree_to_tree(parent_tree.as_ref(), Some(&tree), None)?;

    // Use foreach instead of print(Patch) for performance
    let mut stats: std::collections::HashMap<String, (usize, usize)> =
        std::collections::HashMap::new();
    diff.foreach(
        &mut |_delta, _progress| true,
        None,
        None,
        Some(&mut |delta, _hunk, line| {
            let path = delta
                .new_file()
                .path()
                .or_else(|| delta.old_file().path())
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or_default();
            let entry = stats.entry(path).or_insert((0, 0));
            match line.origin() {
                '+' => entry.0 += 1,
                '-' => entry.1 += 1,
                _ => {}
            }
            true
        }),
    )?;

    let mut changes = Vec::new();
    for delta in diff.deltas() {
        let path = delta
            .new_file()
            .path()
            .or_else(|| delta.old_file().path())
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default();

        let status = match delta.status() {
            git2::Delta::Added => FileStatus::Added,
            git2::Delta::Deleted => FileStatus::Deleted,
            git2::Delta::Renamed => FileStatus::Renamed,
            _ => FileStatus::Modified,
        };

        let (additions, deletions) = stats.get(path.as_str()).copied().unwrap_or((0, 0));
        changes.push(FileChange { path, status, additions, deletions });
    }

    Ok(changes)
}

fn parse_diff(diff: &git2::Diff, file_path: &str) -> Result<FileDiff, SpsError> {
    let mut hunks: Vec<DiffHunk> = Vec::new();

    diff.print(git2::DiffFormat::Patch, |_delta, hunk, line| {
        match line.origin() {
            '+' | '-' | ' ' => {
                let kind = match line.origin() {
                    '+' => LineKind::Addition,
                    '-' => LineKind::Deletion,
                    _ => LineKind::Context,
                };

                let diff_line = DiffLine {
                    kind,
                    content: String::from_utf8_lossy(line.content()).to_string(),
                    old_lineno: line.old_lineno(),
                    new_lineno: line.new_lineno(),
                };

                if hunks.is_empty() {
                    let header = hunk
                        .map(|h| String::from_utf8_lossy(h.header()).trim().to_string())
                        .unwrap_or_default();
                    hunks.push(DiffHunk {
                        header,
                        lines: vec![diff_line],
                    });
                } else {
                    hunks.last_mut().unwrap().lines.push(diff_line);
                }
            }
            'H' => {
                let header = hunk
                    .map(|h| String::from_utf8_lossy(h.header()).trim().to_string())
                    .unwrap_or_default();
                hunks.push(DiffHunk {
                    header,
                    lines: Vec::new(),
                });
            }
            _ => {}
        }
        true
    })?;

    Ok(FileDiff {
        path: file_path.to_string(),
        hunks,
    })
}

fn read_file_as_addition(full_path: &Path, file_path: &str) -> Result<FileDiff, SpsError> {
    let content = std::fs::read_to_string(full_path)?;
    let lines: Vec<DiffLine> = content
        .lines()
        .enumerate()
        .map(|(i, line)| DiffLine {
            kind: LineKind::Addition,
            content: format!("{}\n", line),
            old_lineno: None,
            new_lineno: Some((i + 1) as u32),
        })
        .collect();

    let total = lines.len();
    let header = format!("@@ -0,0 +1,{} @@ (new file)", total);

    Ok(FileDiff {
        path: file_path.to_string(),
        hunks: vec![DiffHunk { header, lines }],
    })
}
