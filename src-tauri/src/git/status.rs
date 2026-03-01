use std::collections::HashMap;

use git2::{DiffOptions, Repository, StatusOptions};

use crate::error::SpsError;
use crate::types::{FileChange, FileStatus};

pub fn count_changes(repo: &Repository) -> Result<usize, SpsError> {
    let mut opts = StatusOptions::new();
    opts.include_untracked(true);
    let statuses = repo.statuses(Some(&mut opts))?;
    Ok(statuses.len())
}

pub fn get_working_changes(repo: &Repository) -> Result<Vec<FileChange>, SpsError> {
    let mut opts = StatusOptions::new();
    opts.include_untracked(true)
        .recurse_untracked_dirs(true);

    let statuses = repo.statuses(Some(&mut opts))?;
    let stats = compute_line_stats_fast(repo)?;

    let mut changes = Vec::new();

    for entry in statuses.iter() {
        let path = entry.path().unwrap_or("").to_string();
        let st = entry.status();

        let status = if st.is_wt_new() || st.is_index_new() {
            FileStatus::Added
        } else if st.is_wt_deleted() || st.is_index_deleted() {
            FileStatus::Deleted
        } else if st.is_wt_renamed() || st.is_index_renamed() {
            FileStatus::Renamed
        } else if st.is_wt_modified() || st.is_index_modified() {
            FileStatus::Modified
        } else {
            FileStatus::Untracked
        };

        let (additions, deletions) = stats.get(path.as_str()).copied().unwrap_or((0, 0));

        let (additions, deletions) = if additions == 0
            && deletions == 0
            && matches!(status, FileStatus::Added | FileStatus::Untracked)
        {
            count_new_file_lines(repo, &path)
        } else {
            (additions, deletions)
        };

        changes.push(FileChange { path, status, additions, deletions });
    }

    Ok(changes)
}

fn compute_line_stats_fast(repo: &Repository) -> Result<HashMap<String, (usize, usize)>, SpsError> {
    let mut diff_opts = DiffOptions::new();
    diff_opts.include_untracked(true).recurse_untracked_dirs(true);

    let diff = repo.diff_index_to_workdir(None, Some(&mut diff_opts))?;
    let mut stats: HashMap<String, (usize, usize)> = HashMap::new();

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

    Ok(stats)
}

fn count_new_file_lines(repo: &Repository, file_path: &str) -> (usize, usize) {
    let workdir = match repo.workdir() {
        Some(w) => w,
        None => return (0, 0),
    };
    let full_path = workdir.join(file_path);
    match std::fs::read_to_string(full_path) {
        Ok(content) => (content.lines().count().max(1), 0),
        Err(_) => (0, 0),
    }
}
