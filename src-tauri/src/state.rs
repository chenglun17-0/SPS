use std::path::PathBuf;
use std::sync::Mutex;

use serde::{Deserialize, Serialize};

use crate::types::ProjectInfo;

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct PersistedState {
    pub projects: Vec<String>,
}

pub struct AppState {
    pub projects: Mutex<Vec<ProjectInfo>>,
    pub data_file: PathBuf,
}

impl AppState {
    pub fn new(data_dir: PathBuf) -> Self {
        let data_file = data_dir.join("projects.json");
        let persisted = Self::load_from_disk(&data_file);
        let projects = persisted
            .projects
            .iter()
            .filter_map(|p| crate::git::repo::get_project_info(p).ok())
            .collect();

        Self {
            projects: Mutex::new(projects),
            data_file,
        }
    }

    fn load_from_disk(path: &PathBuf) -> PersistedState {
        std::fs::read_to_string(path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default()
    }

    pub fn save_to_disk(&self) {
        let projects = self.projects.lock().unwrap();
        let persisted = PersistedState {
            projects: projects.iter().map(|p| p.path.clone()).collect(),
        };
        if let Some(parent) = self.data_file.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let _ = std::fs::write(
            &self.data_file,
            serde_json::to_string_pretty(&persisted).unwrap_or_default(),
        );
    }
}
