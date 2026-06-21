const form = document.getElementById("project-form");
const message = document.getElementById("form-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    name: formData.get("name"),
    repositoryUrl: formData.get("repositoryUrl"),
    description: formData.get("description") || null,
  };

  message.hidden = true;

  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    message.hidden = false;
    message.textContent = error.error?.message ?? "Unable to create project.";
    return;
  }

  const project = await response.json();
  window.location.href = `/project.html?id=${project.id}`;
});
