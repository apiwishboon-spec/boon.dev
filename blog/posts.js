let posts = [];

const postList = document.getElementById("post-list");
const searchInput = document.getElementById("search-input");
const tagFilter = document.getElementById("tag-filter");

function escapeHtml(input) {
    return input
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(dateText) {
    const date = new Date(dateText);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit"
    });
}

function renderPosts(posts) {
    if (!posts.length) {
        postList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-light border mb-0">
                    No posts match your search.
                </div>
            </div>
        `;
        return;
    }

    postList.innerHTML = posts.map(post => `
        <article class="col-md-6">
            <div class="card border-0 bg-white h-100 post-card">
                <div class="card-body">
                    <p class="small text-muted mb-2">${formatDate(post.date)}</p>
                    <h2 class="h5 fw-bold">${escapeHtml(post.title)}</h2>
                    <p class="mb-2">${escapeHtml(post.excerpt)}</p>
                    <p class="small text-muted mb-3">${escapeHtml(post.content)}</p>
                    <div class="d-flex flex-wrap gap-2">
                        ${post.tags.map(tag => `<span class="badge bg-light text-dark border">${escapeHtml(tag)}</span>`).join("")}
                    </div>
                </div>
            </div>
        </article>
    `).join("");
}

function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedTag = tagFilter.value;

    const filtered = posts.filter(post => {
        const matchTag = selectedTag === "all" || post.tags.includes(selectedTag);
        const searchBody = `${post.title} ${post.excerpt} ${post.content} ${post.tags.join(" ")}`.toLowerCase();
        const matchSearch = query.length === 0 || searchBody.includes(query);
        return matchTag && matchSearch;
    });

    renderPosts(filtered);
}

function initTagOptions() {
    tagFilter.innerHTML = '<option value="all">All tags</option>';
    const uniqueTags = [...new Set(posts.flatMap(post => post.tags))].sort();
    uniqueTags.forEach(tag => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

async function loadPosts() {
    try {
        const response = await fetch("./posts.json");
        if (!response.ok) {
            throw new Error(`Failed to load posts: HTTP ${response.status}`);
        }

        posts = await response.json();
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        initTagOptions();
        applyFilters();
    } catch (error) {
        postList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger mb-0">
                    Failed to load blog posts. Please check <code>blog/posts.json</code>.
                </div>
            </div>
        `;
        console.error(error);
    }
}

searchInput.addEventListener("input", applyFilters);
tagFilter.addEventListener("change", applyFilters);
loadPosts();
