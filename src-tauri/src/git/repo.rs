use git2::Repository;

use crate::error::SpsError;
use crate::types::ProjectInfo;

pub fn open_repo(path: &str) -> Result<Repository, SpsError> {
    Ok(Repository::discover(path)?)
}

pub fn get_project_info(path: &str) -> Result<ProjectInfo, SpsError> {
    let repo = open_repo(path)?;
    let branch = get_current_branch(&repo);
    let changed = crate::git::status::count_changes(&repo)?;

    let is_worktree = repo.is_worktree();

    Ok(ProjectInfo {
        path: path.to_string(),
        name: std::path::Path::new(path)
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| path.to_string()),
        branch,
        changed_files: changed,
        is_worktree,
    })
}

fn get_current_branch(repo: &Repository) -> String {
    repo.head()
        .ok()
        .and_then(|h| h.shorthand().map(String::from))
        .unwrap_or_else(|| "HEAD".to_string())
}
