const posts = [
    "website-launch.md",
    "game-jam.md"
];

const newsContainer = document.getElementById("news-container");

async function loadPosts() {
    newsContainer.innerHTML = "";

    for (const post of posts) {
        try {
            const response = await fetch(`/posts/${post}`);

            if (!response.ok) {
                throw new Error(`Couldn't load ${post}`);
            }

            const markdown = await response.text();

            const article = document.createElement("article");
            article.classList.add("news-post");

            article.innerHTML = marked.parse(markdown);

            newsContainer.appendChild(article);

        } catch (error) {
            console.error(error);
        }
    }
}

loadPosts();