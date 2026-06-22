let projectId = null;
let pollingIntervalId = null;

const stateEl = document.getElementById("details-state");
const cardEl = document.getElementById("project-card");
const startScanBtn = document.getElementById("start-scan-button");
const scansStateEl = document.getElementById("scans-state");
const scansListEl = document.getElementById("scans-list");
const scanDetailsPanel = document.getElementById("scan-details-panel");
const closeScanDetailsBtn = document.getElementById("close-scan-details-button");

async function loadProject() {
  const params = new URLSearchParams(window.location.search);
  projectId = params.get("id");

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
  
  startScanBtn.hidden = false;
  
  await loadScans();
}

async function loadScans(quiet = false) {
  if (!projectId) return;
  
  try {
    const response = await fetch(`/api/projects/${projectId}/scans`);
    if (!response.ok) {
      if (!quiet) {
        scansStateEl.textContent = "Unable to load scans.";
      }
      return;
    }
    
    const scans = await response.json();
    if (scans.length === 0) {
      scansStateEl.textContent = "No scans executed yet.";
      scansStateEl.hidden = false;
      scansListEl.hidden = true;
      stopPolling();
      return;
    }
    
    scansListEl.innerHTML = scans.map((scan, index) => {
      const dateStr = new Date(scan.createdAt).toLocaleString();
      const statusBadge = `<span class="badge badge-${scan.status.toLowerCase()}">${scan.status}</span>`;
      return `
        <div class="scan-item" data-scan-id="${scan.id}">
          <div class="scan-item-meta">
            <span class="scan-item-title">Scan #${scans.length - index}</span>
            <span class="scan-item-date">${dateStr}</span>
          </div>
          <div>${statusBadge}</div>
        </div>
      `;
    }).join("");
    
    scansStateEl.hidden = true;
    scansListEl.hidden = false;
    
    // Add click listeners to scan items
    document.querySelectorAll(".scan-item").forEach(item => {
      item.addEventListener("click", () => {
        const scanId = item.getAttribute("data-scan-id");
        viewScanDetails(scanId);
      });
    });
    
    // Check if any scan is Pending or Running
    const hasActiveScans = scans.some(s => s.status === "Pending" || s.status === "Running");
    if (hasActiveScans) {
      startPolling();
    } else {
      stopPolling();
    }
  } catch (err) {
    console.error("Error loading scans", err);
    if (!quiet) {
      scansStateEl.textContent = "Failed to fetch scans.";
    }
  }
}

async function startScan() {
  if (!projectId) return;
  startScanBtn.disabled = true;
  
  try {
    const response = await fetch(`/api/projects/${projectId}/scans`, {
      method: "POST"
    });
    if (!response.ok) {
      const error = await response.json();
      alert(error.error?.message ?? "Failed to initiate scan.");
      return;
    }
    
    const newScan = await response.json();
    await loadScans();
    viewScanDetails(newScan.id);
  } catch (err) {
    console.error("Error initiating scan", err);
    alert("Connection error initiating scan.");
  } finally {
    startScanBtn.disabled = false;
  }
}

async function viewScanDetails(scanId) {
  try {
    const response = await fetch(`/api/scans/${scanId}`);
    if (!response.ok) {
      alert("Unable to fetch scan details.");
      return;
    }
    
    const scan = await response.json();
    document.getElementById("scan-detail-id").textContent = scan.id;
    
    const statusBadge = `<span class="badge badge-${scan.status.toLowerCase()}">${scan.status}</span>`;
    document.getElementById("scan-detail-status").innerHTML = statusBadge;
    document.getElementById("scan-detail-created").textContent = new Date(scan.createdAt).toLocaleString();
    document.getElementById("scan-detail-started").textContent = scan.startedAt ? new Date(scan.startedAt).toLocaleString() : "Not started";
    document.getElementById("scan-detail-completed").textContent = scan.completedAt ? new Date(scan.completedAt).toLocaleString() : "Not completed";
    
    const failureContainer = document.getElementById("scan-detail-failure-container");
    if (scan.status === "Failed" && scan.failureReason) {
      document.getElementById("scan-detail-failure").textContent = scan.failureReason;
      failureContainer.hidden = false;
    } else {
      failureContainer.hidden = true;
    }
    
    scanDetailsPanel.hidden = false;
    // Scroll details panel into view
    scanDetailsPanel.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Error fetching scan details", err);
  }
}

function startPolling() {
  if (pollingIntervalId) return;
  pollingIntervalId = setInterval(() => {
    loadScans(true);
    // If details panel is open and visible, refresh it too
    if (!scanDetailsPanel.hidden) {
      const activeScanId = document.getElementById("scan-detail-id").textContent;
      if (activeScanId) {
        viewScanDetails(activeScanId);
      }
    }
  }, 2000);
}

function stopPolling() {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
}

startScanBtn.addEventListener("click", startScan);
closeScanDetailsBtn.addEventListener("click", () => {
  scanDetailsPanel.hidden = true;
});

loadProject();
