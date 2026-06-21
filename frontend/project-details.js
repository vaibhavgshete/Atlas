const stateEl = document.getElementById("details-state");
const cardEl = document.getElementById("project-card");

async function loadProject() {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");

  if (!projectId) {
    stateEl.textContent = "Project id is missing.";
    return;
  }

  const response = await fetch(`/api/projects/${projectId}`);
  if (!response.ok) {
    const error = await response.json();
    stateEl.textContent = error.error?.message ?? "Unable to load project.";
    return;
  }

  const project = await response.json();
  cardEl.innerHTML = `
    <h2>${project.name}</h2>
    <dl class="detail-list">
      <div>
        <dt>Repository URL</dt>
        <dd>${project.repositoryUrl}</dd>
      </div>
      <div>
        <dt>Description</dt>
        <dd>${project.description ?? "No description provided."}</dd>
      </div>
      <div>
        <dt>Created</dt>
        <dd>${new Date(project.createdAt).toLocaleString()}</dd>
      </div>
      <div>
        <dt>Updated</dt>
        <dd>${new Date(project.updatedAt).toLocaleString()}</dd>
      </div>
    </dl>
  `;
  stateEl.hidden = true;
  cardEl.hidden = false;
}

loadProject();
