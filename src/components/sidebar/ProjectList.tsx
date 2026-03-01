import { For, Show } from "solid-js";
import {
  projects,
  selectedPath,
  setSelectedPath,
  removeProject,
} from "../../stores/projects";
import styles from "../../styles/sidebar.module.css";
import ProjectItem from "./ProjectItem";
import AddProject from "./AddProject";

function ProjectList() {
  return (
    <>
      <div class={styles.header}>
        <h2>Projects</h2>
        <AddProject />
      </div>
      <div class={styles.list}>
        <Show
          when={projects().length > 0}
          fallback={
            <div class={styles.empty}>
              Click + to add a project folder
            </div>
          }
        >
          <For each={projects()}>
            {(project) => (
              <ProjectItem
                project={project}
                active={selectedPath() === project.path}
                onSelect={() => setSelectedPath(project.path)}
                onRemove={() => removeProject(project.path)}
              />
            )}
          </For>
        </Show>
      </div>
    </>
  );
}

export default ProjectList;
