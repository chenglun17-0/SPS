import { open } from "@tauri-apps/plugin-dialog";
import styles from "../../styles/sidebar.module.css";
import { scanAndAdd } from "../../stores/projects";

function AddProject() {
  async function handleScan() {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      await scanAndAdd(selected as string);
    }
  }

  return (
    <button class={styles.addBtn} onClick={handleScan} title="Add project folder">
      +
    </button>
  );
}

export default AddProject;
