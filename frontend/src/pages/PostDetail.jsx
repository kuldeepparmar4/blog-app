import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./PostDetail.css";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts/${id}`);
      setPost(res.data.post);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "Post not found."
          : "Failed to load post.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This cannot be undone.",
      )
    )
      return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${id}`);
      toast.success("Post deleted successfully.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post.");
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const canModify =
    isLoggedIn &&
    post &&
    (user?.id === post.author?._id || user?.role === "admin");

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );

  if (error)
    return (
      <div
        className="container"
        style={{ padding: "4rem 1.5rem", textAlign: "center" }}
      >
        <div className="alert alert-danger" style={{ display: "inline-block" }}>
          {error}
        </div>
        <br />
        <br />
        <Link to="/" className="btn btn-outline">
          ← Back to Home
        </Link>
      </div>
    );

  if (!post) return null;

  return (
    <div className="postdetail-page">
      <div className="container">
        <div className="postdetail-inner">
          <Link to="/" className="back-link">
            ← Back to all posts
          </Link>

          <article className="postdetail-article card">
            {post.image?.url && (
              <img
                src={post.image.url}
                alt={post.title}
                className="postdetail-cover"
              />
            )}

            <div className="postdetail-body">
              {post.tags?.length > 0 && (
                <div className="post-tags" style={{ marginBottom: "1rem" }}>
                  {post.tags.map((tag) => (
                    <span key={tag} className="badge badge-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="postdetail-title">{post.title}</h1>

              <div className="postdetail-meta">
                <div className="author-info">
                  <div className="author-avatar">
                    {post.author?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="author-name">{post.author?.username}</div>
                    <div className="post-date">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="post-views">👁️ {post.views} views</div>
              </div>

              <hr className="divider" />

              <div className="postdetail-content">
                {post.content
                  .split("\n")
                  .map((para, i) =>
                    para.trim() ? <p key={i}>{para}</p> : <br key={i} />,
                  )}
              </div>

              {canModify && (
                <div className="postdetail-actions">
                  <Link to={`/edit/${post._id}`} className="btn btn-outline">
                    ✏️ Edit Post
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "🗑️ Delete Post"}
                  </button>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
