const stateEl = document.getElementById("projects-state");
const listEl = document.getElementById("projects-list");
const refreshButton = document.getElementById("refresh-button");

async function fetchProjects() {
  stateEl.hidden = false;
  listEl.hidden = true;
  stateEl.textContent = "Loading projects...";

  const response = await fetch("/api/projects");
  if (!response.ok) {
    throw new Error("Unable to load projects.");
  }

  return response.json();
}

function renderProjects(projects) {
  if (projects.length === 0) {
    stateEl.hidden = false;
    listEl.hidden = true;
    stateEl.textContent = "No projects yet. Create the first one to get started.";
    return;
  }

  listEl.innerHTML = projects
    .map(
      (project) => `
        <article class="project-card">
          <div>
            <h3>${project.name}</h3>
            <p class="meta">${project.repositoryUrl}</p>
            <p>${project.description ?? "No description provided."}</p>
          </div>
          <div class="card-actions">
            <a class="button button-secondary" href="/project.html?id=${project.id}">View Details</a>
            <button class="button button-danger" type="button" data-delete-id="${project.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");

  stateEl.hidden = true;
  listEl.hidden = false;

  for (const button of listEl.querySelectorAll("[data-delete-id]")) {
    button.addEventListener("click", async () => {
      const projectId = button.getAttribute("data-delete-id");
      if (!projectId) {
        return;
      }

      button.disabled = true;
      try {
        const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
        if (!response.ok) {
          throw new Error("Unable to delete project.");
        }
        await loadProjects();
      } catch (error) {
        stateEl.hidden = false;
        stateEl.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  }
}

async function loadProjects() {
  try {
    const projects = await fetchProjects();
    renderProjects(projects);
  } catch (error) {
    stateEl.hidden = false;
    listEl.hidden = true;
    stateEl.textContent = error.message;
  }
}

refreshButton.addEventListener("click", loadProjects);

loadProjects();
