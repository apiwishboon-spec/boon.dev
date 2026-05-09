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
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        ${post.tags.map(tag => `<span class="badge bg-light text-dark border">${escapeHtml(tag)}</span>`).join("")}
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showPostModal(${posts.indexOf(post)})">
                        Read More <i class="fas fa-arrow-right ms-1"></i>
                    </button>
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

function showPostModal(postIndex) {
    const post = posts[postIndex];
    if (!post) return;

    document.getElementById('postModalTitle').textContent = post.title;
    document.getElementById('postModalDate').textContent = formatDate(post.date);
    document.getElementById('postModalImage').src = post.image || '../icon.png';
    document.getElementById('postModalImage').alt = post.title;
    document.getElementById('postModalContent').innerHTML = `
        <p class="lead">${escapeHtml(post.excerpt)}</p>
        <div class="mb-3">${escapeHtml(post.fullContent || post.content)}</div>
    `;
    
    const tagsContainer = document.getElementById('postModalTags');
    tagsContainer.innerHTML = post.tags.map(tag => 
        `<span class="badge bg-primary me-2">${escapeHtml(tag)}</span>`
    ).join('');

    const modal = new bootstrap.Modal(document.getElementById('postModal'));
    modal.show();
}

searchInput.addEventListener("input", applyFilters);
tagFilter.addEventListener("change", applyFilters);
loadPosts();
