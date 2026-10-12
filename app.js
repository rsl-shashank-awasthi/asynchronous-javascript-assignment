
let refreshIntervalId = null;

document.getElementById("fetchBtn").addEventListener("click", async () => {
  const username = document.getElementById("usernameInput").value.trim();
  if (!username) return;

  await fetchAndDisplayData(username);

  if (refreshIntervalId) clearInterval(refreshIntervalId);
  refreshIntervalId = setInterval(async () => {
    console.log(`Refreshing data for ${username}...`);
    await fetchAndDisplayData(username);
  }, 60000);
});

async function fetchAndDisplayData(username) {
  const statusMsg = document.getElementById("statusMessage");
  const ownerDiv = document.getElementById("ownerContainer");
  const reposDiv = document.getElementById("reposContainer");

  statusMsg.innerHTML = "Fetching data...";
  statusMsg.className = "";
  ownerDiv.innerHTML = "";
  reposDiv.innerHTML = "";

  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);

    if (userRes.status === 404) {
      throw new Error("Invalid GitHub username. User not found.");
    }
    if (!userRes.ok) {
      throw new Error(`API Failure: ${userRes.statusText}`);
    }

    const userData = await userRes.json();

    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos`,
    );
    if (!reposRes.ok) {
      throw new Error(`Failed to fetch repositories: ${reposRes.statusText}`);
    }
    const reposData = await reposRes.json();

    ownerDiv.innerHTML = `
            <div class="owner-details">
                <img src="${userData.avatar_url}" alt="Profile Picture">
                <h2>${userData.name || userData.login}</h2>
                <p><strong>Bio:</strong> ${userData.bio || "N/A"}</p>
                <p><strong>Public Repos:</strong> ${userData.public_repos}</p>
            </div>
        `;

    if (reposData.length === 0) {
      reposDiv.innerHTML = "<p>This user has no public repositories.</p>";
    } else {
      reposData.forEach((repo) => {
        const repoEl = document.createElement("div");
        repoEl.className = "repo";
        repoEl.innerHTML = `
                    <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                    <p>${repo.description || "No description available."}</p>
                    <p>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | 🛠️ ${repo.language || "N/A"}</p>
                `;
        reposDiv.appendChild(repoEl);
      });
    }

    statusMsg.innerHTML = `Data loaded successfully at ${new Date().toLocaleTimeString()}`;
    statusMsg.style.color = "green";
  } catch (error) {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }

    statusMsg.innerHTML = error.message;
    statusMsg.className = "error";
    console.error(error);
  }
}
