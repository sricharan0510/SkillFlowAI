import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import { ArrowLeft, Download, Calendar, FileText, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import api from "../../services/axios"; 
import { useAuth } from "../../contexts/AuthContext";

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, loading: authLoading } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNote() {
      try {
        setLoading(true);
        const res = await api.get(`/materials/${id}`);
        setNote(res.data.material);
      } catch (err) {
        console.warn("Specific fetch failed, trying fallback...", err);
        try {
            const allRes = await api.get('/materials?category=note');
            const found = allRes.data.materials.find(m => m._id === id);
            if (found) {
                setNote(found);
            } else {
                setError("Note not found in database.");
            }
        } catch (fallbackErr) {
            setError("Failed to load note details.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (authLoading) return;
    if (!accessToken) {
      navigate('/signin');
      return;
    }

    if (id) fetchNote();
  }, [id, authLoading, accessToken]);

  const handleDownloadPDF = () => {
    if (!note || !note.summary) return;
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(20);
    const title = note.title || "Document";
    doc.text(title, margin, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date(note.createdAt).toLocaleDateString()}`, margin, 30);
    doc.setFontSize(12);

    const cleanText = note.summary.replace(/[#*`]/g, "");
    const wrapped = doc.splitTextToSize(cleanText, pageWidth - margin * 2);

    let y = 40;
    const lineHeight = 7; 
    for (let i = 0; i < wrapped.length; i++) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin + 10;
      }
      doc.text(wrapped[i], margin, y);
      y += lineHeight;
    }

    const safeTitle = title.replace(/[\\/:*?"<>|]/g, "-");
    doc.save(`${safeTitle}.pdf`);
  };

  if (loading) return (
      <DashboardLayout>
          <div className="flex h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      </DashboardLayout>
  );

  if (error || !note) return (
      <DashboardLayout>
          <div className="max-w-4xl mx-auto py-10">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="p-8 border border-red-200 bg-red-50 text-red-700 rounded-xl">
                  {error || "Note not found."}
              </div>
          </div>
      </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-10">

        <div className="sticky top-16 z-30 bg-card/80 backdrop-blur-sm py-4 px-2 rounded-md">
          <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold truncate max-w-[60vw]">{note.title}</h1>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg font-medium hover:opacity-90">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
            </div>

            <div className="mt-3 text-sm text-muted-foreground flex items-center gap-6">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(note.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> {note.pageCount || "?"} Pages</span>
            </div>
          </div>
        </div>

        <div className="mt-6 max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[480px]">
            <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
              <ReactMarkdown>{note.summary}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}