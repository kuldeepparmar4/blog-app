import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchMyPosts = useCallback(async () => {
    try {
      // Get all posts then filter by current user
      const res = await api.get("/posts", { params: { limit: 100 } });
      const mine = res.data.posts.filter(
        (post) => post.author?._id === user?.id,
      );
      setMyPosts(mine);
    } catch (err) {
      toast.error("Failed to load your posts.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // re-runs if the logged-in user changes

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleDelete = async (postId, postTitle) => {
    if (!window.confirm(`Delete "${postTitle}"? This cannot be undone.`))
      return;
    setDeleting(postId);
    try {
      await api.delete(`/posts/${postId}`);
      setMyPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted.");
    } catch (err) {
      toast.error("Failed to delete post.");
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully.");
    navigate("/");
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header Card */}
        <div className="profile-header card">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user?.username}</h1>
            <p className="profile-email">📧 {user?.email}</p>
            <p className="profile-joined">
              🗓️ Member since {formatDate(user?.createdAt || Date.now())}
            </p>
            <p className="profile-post-count">
              📝 {myPosts.length} post{myPosts.length !== 1 ? "s" : ""}{" "}
              published
            </p>
          </div>
          <div className="profile-actions">
            <Link to="/create" className="btn btn-primary">
              + New Post
            </Link>
            <button className="btn btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* My Posts Section */}
        <div className="my-posts-section">
          <h2>My Posts</h2>

          {loading && (
            <div className="loading-center">
              <div className="spinner" style={{ width: 32, height: 32 }}></div>
            </div>
          )}

          {!loading && myPosts.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✍️</div>
              <h3>No posts yet</h3>
              <p>Start writing and share your ideas with the world!</p>
              <Link to="/create" className="btn btn-primary">
                Write Your First Post
              </Link>
            </div>
          )}

          <div className="my-posts-list">
            {myPosts.map((post) => (
              <div key={post._id} className="my-post-item card">
                {post.image?.url && (
                  <img
                    src={post.image.url}
                    alt={post.title}
                    className="my-post-thumb"
                  />
                )}
                <div className="my-post-info">
                  <h3>
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                  </h3>
                  <p className="my-post-meta">
                    📅 {formatDate(post.createdAt)} &nbsp;|&nbsp; 👁️{" "}
                    {post.views} views
                  </p>
                  {post.tags?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        flexWrap: "wrap",
                        marginTop: "0.5rem",
                      }}
                    >
                      {post.tags.map((tag) => (
                        <span key={tag} className="badge badge-gray">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="my-post-actions">
                  <Link
                    to={`/edit/${post._id}`}
                    className="btn btn-outline btn-sm"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(post._id, post.title)}
                    disabled={deleting === post._id}
                  >
                    {deleting === post._id ? "..." : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
