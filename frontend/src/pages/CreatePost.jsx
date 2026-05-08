import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";
import "./PostForm.css";

export default function CreatePost() {
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [image, setImage] = useState(null); // the actual File object
  const [preview, setPreview] = useState(""); // URL for image preview
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors([]);
  };

  // When user picks an image file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(["Image must be smaller than 5MB."]);
      return;
    }

    setImage(file);
    // createObjectURL creates a temporary local URL to preview the image
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
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

    // FormData is required when sending files + text together
    // Normal JSON cannot carry files
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("tags", form.tags);
    if (image) formData.append("image", image); // 'image' must match upload.single('image') in backend

    try {
      const res = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Post published successfully! 🎉");
      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create post.";
      setErrors([msg]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="postform-page">
      <div className="container">
        <div className="postform-header">
          <h1>Create New Post</h1>
          <p>Share your ideas with the world</p>
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
                placeholder="Give your post a great title..."
                value={form.title}
                onChange={handleChange}
                required
                maxLength={200}
              />
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                {form.title.length}/200
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea
                name="content"
                className="form-textarea"
                placeholder="Write your post content here..."
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
              <span className="form-hint">Help readers find your post</span>
            </div>

            <div className="form-group">
              <label className="form-label">Cover Image (optional)</label>
              {!preview ? (
                <label className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <div className="upload-placeholder">
                    <span className="upload-icon">🖼️</span>
                    <p>Click to upload image</p>
                    <small>JPG, PNG, WEBP up to 5MB</small>
                  </div>
                </label>
              ) : (
                <div className="image-preview-wrap">
                  <img src={preview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
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
                    Publishing...
                  </>
                ) : (
                  "🚀 Publish Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
