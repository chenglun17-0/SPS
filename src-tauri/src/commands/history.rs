use crate::error::SpsError;
use crate::git;
use crate::types::{CommitInfo, FileChange};

#[tauri::command]
pub fn get_commit_log(repo_path: String, limit: usize) -> Result<Vec<CommitInfo>, SpsError> {
    let repo = git::repo::open_repo(&repo_path)?;
    git::log::get_commit_log(&repo, limit)
}

#[tauri::command]
pub fn get_commit_files(
    repo_path: String,
    commit_id: String,
) -> Result<Vec<FileChange>, SpsError> {
    let repo = git::repo::open_repo(&repo_path)?;
    git::diff::get_commit_files(&repo, &commit_id)
}
