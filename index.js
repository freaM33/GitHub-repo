const repoSearchInput = document.querySelector("#repo-search-input");
const repositoryCardTemplate = document.querySelector("#repo-card");
const resultsContainer = document.querySelector(".results-area");
const suggestionsDropdown = document.querySelector("#suggestions-list");

const createDelayedFunction = (fn, delayTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delayTime);
  };
};

const createRepositoryCard = (item) => {
  const card = repositoryCardTemplate.content.cloneNode(true);
  card.querySelector(".repo-title").textContent = `Name: ${item.name}`;
  card.querySelector(".repo-author").textContent = `Owner: ${item.owner.login}`;
  card.querySelector(
    ".repo-rating"
  ).textContent = `Stars: ${item.stargazers_count}`;
  card.querySelector(".remove-btn").addEventListener("click", (evt) => {
    evt.target.parentNode.remove();
  });
  resultsContainer.append(card);
  repoSearchInput.value = "";
  suggestionsDropdown.innerHTML = "";
};

const fetchRepositories = async (request) => {
  if (!request || request.trim() === "") {
    suggestionsDropdown.innerHTML = "";
    return;
  }
  
  try {
    const encodedQuery = encodeURIComponent(request);
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodedQuery}&per_page=5`,
      {
        headers: {
          "Accept": "application/vnd.github.v3+json",
        },
      }
    );
    
    if (response.ok) {
      const repos = await response.json();
      suggestionsDropdown.innerHTML = "";
      const items = repos.items || [];
      if (items.length === 0) {
        suggestionsDropdown.innerHTML = '<p class="empty-message">No results...</p>';
      } else {
        items.forEach((item) => {
          const suggestionItem = document.createElement("p");
          suggestionItem.className = "suggestion-item";
          suggestionItem.textContent = `${item.name}`;
          suggestionItem.addEventListener("click", () => createRepositoryCard(item));
          suggestionsDropdown.append(suggestionItem);
        });
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("GitHub API error:", response.status, errorData);
      suggestionsDropdown.innerHTML = '<p class="empty-message">Try again...</p>';
    }
  } catch (error) {
    suggestionsDropdown.innerHTML = '<p class="empty-message">Network error. Try again...</p>';
    console.error("Error fetching repositories:", error);
  }
};

const delayedFetchRepos = createDelayedFunction(fetchRepositories, 1000);

repoSearchInput.addEventListener("input", () => {
  const trimmedValue = repoSearchInput.value.trim();
  if (trimmedValue === "" || repoSearchInput.value[0] === " ") {
    suggestionsDropdown.innerHTML = "";
    return;
  }
  delayedFetchRepos(trimmedValue);
});
