use crate::error::SpsError;
use crate::git;
use crate::types::FileChange;

#[tauri::command]
pub fn get_working_changes(repo_path: String) -> Result<Vec<FileChange>, SpsError> {
    let repo = git::repo::open_repo(&repo_path)?;
    git::status::get_working_changes(&repo)
}
