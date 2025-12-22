import { useState } from "react";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import { uploadMaterial } from "../../services/materialApi";
import { toast } from "sonner";

export default function UploadMaterial() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [material, setMaterial] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error("PDF must be under 10MB");
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error("Please provide title and PDF");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("title", title);

      const res = await uploadMaterial(formData);

      setMaterial(res.data.material);
      toast.success("PDF uploaded & processed successfully");

      setFile(null);
      setTitle("");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "PDF upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">
          Upload Study Material
        </h1>

        {/* Upload Card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md bg-background"
              placeholder="e.g., CN Unit 1 Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* File */}
          <div>
            <label className="text-sm font-medium">PDF File</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full mt-1"
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Uploading & Processing..." : "Upload PDF"}
          </button>
        </div>

        {/* Result */}
        {material && (
          <div className="mt-6 bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">
              Upload Successful
            </h2>

            <p className="text-sm text-muted-foreground">
              Pages extracted: <strong>{material.pageCount}</strong>
            </p>

            <div className="flex gap-3 mt-4">
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-muted rounded-lg"
              >
                View PDF
              </a>

              <button className="px-4 py-2 bg-primary text-white rounded-lg">
                Generate Exam
              </button>

              <button className="px-4 py-2 bg-secondary rounded-lg">
                Summarize
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
