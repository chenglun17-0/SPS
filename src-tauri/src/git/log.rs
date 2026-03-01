use git2::Repository;

use crate::error::SpsError;
use crate::types::CommitInfo;

pub fn get_commit_log(repo: &Repository, limit: usize) -> Result<Vec<CommitInfo>, SpsError> {
    let mut revwalk = repo.revwalk()?;
    revwalk.push_head()?;
    revwalk.set_sorting(git2::Sort::TIME)?;

    let mut commits = Vec::new();

    for oid in revwalk.take(limit) {
        let oid = oid?;
        let commit = repo.find_commit(oid)?;
        let author = commit.author();

        commits.push(CommitInfo {
            id: oid.to_string(),
            message: commit.message().unwrap_or("").trim().to_string(),
            author: author.name().unwrap_or("Unknown").to_string(),
            time: commit.time().seconds(),
        });
    }

    Ok(commits)
}
