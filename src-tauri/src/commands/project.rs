use tauri::State;

use crate::error::SpsError;
use crate::git;
use crate::state::AppState;
use crate::types::ProjectInfo;

#[tauri::command]
pub fn scan_directory(path: String) -> Result<Vec<ProjectInfo>, SpsError> {
    git::scan::scan_directory(&path, 3)
}

#[tauri::command]
pub fn add_project(path: String, state: State<AppState>) -> Result<ProjectInfo, SpsError> {
    let info = git::repo::get_project_info(&path)?;
    let mut projects = state.projects.lock().unwrap();

    if !projects.iter().any(|p| p.path == path) {
        projects.push(info.clone());
        drop(projects);
        state.save_to_disk();
    }

    Ok(info)
}

#[tauri::command]
pub fn remove_project(path: String, state: State<AppState>) -> Result<(), SpsError> {
    let mut projects = state.projects.lock().unwrap();
    projects.retain(|p| p.path != path);
    drop(projects);
    state.save_to_disk();
    Ok(())
}

#[tauri::command]
pub fn list_projects(state: State<AppState>) -> Result<Vec<ProjectInfo>, SpsError> {
    let projects = state.projects.lock().unwrap();
    Ok(projects.clone())
}

#[tauri::command]
pub fn refresh_project(
    path: String,
    state: State<AppState>,
) -> Result<ProjectInfo, SpsError> {
    let info = git::repo::get_project_info(&path)?;
    let mut projects = state.projects.lock().unwrap();

    if let Some(p) = projects.iter_mut().find(|p| p.path == path) {
        *p = info.clone();
    }

    Ok(info)
}
