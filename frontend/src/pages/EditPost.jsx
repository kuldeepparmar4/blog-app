import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./PostForm.css";

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [existingImage, setExistingImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState([]);

  // Load the existing post data when page opens
  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        const post = res.data.post;

        // Allow author OR admin
        const canEdit =
          user && (user.id === post.author?._id || user.role === "admin");

        if (!canEdit) {
          toast.error("You can only edit your own posts.");
          navigate("/");
          return;
        }

        // Pre-fill the form with existing data
        setForm({
          title: post.title,
          content: post.content,
          tags: post.tags?.join(", ") || "",
        });
        if (post.image?.url) {
          setExistingImage(post.image.url);
        }
      } catch (err) {
        toast.error("Failed to load post.");
        navigate("/");
      } finally {
        setFetching(false);
      }
    };
    loadPost();
  }, [id, navigate, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors([]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors(["Image must be smaller than 5MB."]);
      return;
    }
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = [];
    if (form.title.trim().length < 5)
      errs.push("Title must be at least 5 characters.");
    if (form.content.trim().length < 10)
      errs.push("Content must be at least 10 characters.");
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("tags", form.tags);
    if (newImage) formData.append("image", newImage);

    try {
      await api.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Post updated successfully! ✅");
      navigate(`/posts/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update post.";
      setErrors([msg]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="loading-center">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );

  return (
    <div className="postform-page">
      <div className="container">
        <div className="postform-header">
          <h1>Edit Post ✏️</h1>
          <p>Update your post details below</p>
        </div>

        <div className="postform-card card">
          {errors.length > 0 && (
            <div className="alert alert-danger">
              {errors.map((e, i) => (
                <div key={i}>• {e}</div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="Post title..."
                value={form.title}
                onChange={handleChange}
                required
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea
                name="content"
                className="form-textarea"
                placeholder="Write your content..."
                value={form.content}
                onChange={handleChange}
                rows={12}
                required
                style={{ minHeight: "250px" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                className="form-input"
                placeholder="e.g. javascript, react, webdev"
                value={form.tags}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image</label>

              {/* Show existing image if no new image selected */}
              {existingImage && !preview && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#64748b",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Current image:
                  </p>
                  <img
                    src={existingImage}
                    alt="Current"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}

              {/* Show new image preview */}
              {preview && (
                <div
                  className="image-preview-wrap"
                  style={{ marginBottom: "0.75rem" }}
                >
                  <img
                    src={preview}
                    alt="New preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setNewImage(null);
                      setPreview("");
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}

              <label className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <div className="upload-placeholder">
                  <span className="upload-icon">🖼️</span>
                  <p>
                    {existingImage
                      ? "Click to replace image"
                      : "Click to upload image"}
                  </p>
                  <small>JPG, PNG, WEBP up to 5MB</small>
                </div>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner"
                      style={{ width: 16, height: 16 }}
                    ></span>{" "}
                    Saving...
                  </>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
