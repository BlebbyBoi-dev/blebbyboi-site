const GITHUB_API =
    "https://api.github.com/repos/BlebbyBoi-dev/blebbyboi-site/contents/posts";

const newsContainer = document.getElementById("news-container");

async function loadNews() {
    try {
        // Get everything inside /posts/
        const response = await fetch(GITHUB_API);

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }

        const files = await response.json();

        // Only keep Markdown files
        const markdownFiles = files.filter(file =>
            file.type === "file" &&
            file.name.toLowerCase().endsWith(".md")
        );

        // Load every Markdown file
        const posts = await Promise.all(
            markdownFiles.map(async file => {
                const response = await fetch(file.download_url);

                if (!response.ok) {
                    throw new Error(`Failed to load ${file.name}`);
                }

                const markdown = await response.text();

                return {
                    filename: file.name,
                    markdown: markdown
                };
            })
        );

        // Parse frontmatter from each post
        posts.forEach(post => {
            const frontmatterMatch = post.markdown.match(
                /^---\s*\n([\s\S]*?)\n---\s*\n?/
            );

            post.title = post.filename.replace(/\.md$/i, "");
            post.date = "";
            post.description = "";

            if (frontmatterMatch) {
                const frontmatter = frontmatterMatch[1];

                const titleMatch = frontmatter.match(
                    /^title:\s*(.+)$/m
                );

                const dateMatch = frontmatter.match(
                    /^date:\s*(.+)$/m
                );

                const descriptionMatch = frontmatter.match(
                    /^description:\s*(.+)$/m
                );

                if (titleMatch) {
                    post.title = titleMatch[1].trim();
                }

                if (dateMatch) {
                    post.date = dateMatch[1].trim();
                }

                if (descriptionMatch) {
                    post.description = descriptionMatch[1].trim();
                }

                // Remove frontmatter before rendering Markdown
                post.markdown = post.markdown.replace(
                    frontmatterMatch[0],
                    ""
                );
            }
        });

        // Sort newest posts first
        posts.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // Clear loading message
        newsContainer.innerHTML = "";

        // No posts
        if (posts.length === 0) {
            newsContainer.innerHTML = `
                <p>No news posts yet. Check back later!</p>
            `;
            return;
        }

        // Render posts
        for (const post of posts) {
            const article = document.createElement("article");
            article.classList.add("news-post");

            article.innerHTML = `
                <h2>${post.title}</h2>

                ${post.date ? `<p class="post-date">${post.date}</p>` : ""}

                ${post.description
                    ? `<p class="post-description">${post.description}</p>`
                    : ""
                }

                <div class="post-content">
                    ${marked.parse(post.markdown)}
                </div>
            `;

            newsContainer.appendChild(article);
        }

    } catch (error) {
        console.error("Failed to load news:", error);

        newsContainer.innerHTML = `
            <h2>Uh oh.</h2>
            <p>
                I couldn't load the news right now.
                Check back later!
            </p>
        `;
    }
}

loadNews();