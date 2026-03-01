use crate::error::SpsError;
use crate::git;
use crate::types::FileDiff;

#[tauri::command]
pub fn get_working_diff(repo_path: String, file_path: String) -> Result<FileDiff, SpsError> {
    let repo = git::repo::open_repo(&repo_path)?;
    git::diff::get_working_diff(&repo, &file_path)
}

#[tauri::command]
pub fn get_commit_diff(
    repo_path: String,
    commit_id: String,
    file_path: String,
) -> Result<FileDiff, SpsError> {
    let repo = git::repo::open_repo(&repo_path)?;
    git::diff::get_commit_diff(&repo, &commit_id, &file_path)
}
