import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "./Home.css";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchPosts(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/posts", { params: { search, limit: 20 } });
      setPosts(res.data.posts);
    } catch (err) {
      setError(
        "Failed to load posts. Make sure your backend is running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="home-page">
      <div className="hero">
        <div className="container">
          <h1>Welcome to BlogApp ✍️</h1>
          <p>
            Discover stories, ideas, and expertise from writers on any topic.
          </p>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container">
        <div className="home-header">
          <h2>{search ? `Results for "${search}"` : "Latest Posts"}</h2>
          {search && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch("");
                setSearchInput("");
              }}
            >
              Clear Search
            </button>
          )}
        </div>

        {loading && (
          <div className="loading-center">
            <div className="spinner" style={{ width: 40, height: 40 }}></div>
          </div>
        )}

        {error && !loading && (
          <div className="alert alert-danger">⚠️ {error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No posts yet</h3>
            <p>
              {search
                ? "Try a different search term."
                : "Be the first to write something!"}
            </p>
            <Link to="/create" className="btn btn-primary">
              Write First Post
            </Link>
          </div>
        )}

        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post._id} className="post-card card">
              {post.image?.url && (
                <Link to={`/posts/${post._id}`}>
                  <img
                    src={post.image.url}
                    alt={post.title}
                    className="post-card-img"
                  />
                </Link>
              )}
              <div className="post-card-body">
                {post.tags?.length > 0 && (
                  <div className="post-tags">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge badge-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link to={`/posts/${post._id}`}>
                  <h3 className="post-card-title">{post.title}</h3>
                </Link>
                <p className="post-card-excerpt">
                  {post.content.length > 150
                    ? post.content.substring(0, 150) + "..."
                    : post.content}
                </p>
                <div className="post-card-footer">
                  <span className="post-author">
                    ✍️ {post.author?.username || "Unknown"}
                  </span>
                  <span className="post-date">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
