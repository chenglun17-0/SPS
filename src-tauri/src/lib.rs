mod commands;
mod error;
mod git;
mod state;
mod types;

use tauri::Manager;

use state::AppState;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data dir");
            let state = AppState::new(data_dir);
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::project::scan_directory,
            commands::project::add_project,
            commands::project::remove_project,
            commands::project::list_projects,
            commands::project::refresh_project,
            commands::status::get_working_changes,
            commands::diff::get_working_diff,
            commands::diff::get_commit_diff,
            commands::history::get_commit_log,
            commands::history::get_commit_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
