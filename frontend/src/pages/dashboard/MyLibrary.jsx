import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import { 
  Search, 
  FileText, 
  Trash2, 
  Download, 
  Briefcase, 
  BookOpen, 
  StickyNote, 
  Filter
} from "lucide-react";

export default function MyLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); 

  // Dummy Data with 'type'
  const files = [
    { id: 1, name: "Data Structures.pdf", size: "2.4 MB", date: "Oct 24, 2025", type: "Exam" },
    { id: 2, name: "Sricharan_Resume.pdf", size: "1.1 MB", date: "Dec 12, 2025", type: "resume" },
    { id: 3, name: "React_Class_Notes.pdf", size: "500 KB", date: "Dec 18, 2025", type: "note" },
    { id: 4, name: "Java_Interview_Prep.pdf", size: "3.2 MB", date: "Dec 20, 2025", type: "note" },
    { id: 5, name: "Operating_System_Ref.pdf", size: "8.5 MB", date: "Dec 21, 2025", type: "Exam" },
    { id: 6, name: "Operating_System_Ref.pdf", size: "8.5 MB", date: "Dec 21, 2025", type: "Exam" },
    { id: 7, name: "Operating_System_Ref.pdf", size: "8.5 MB", date: "Dec 21, 2025", type: "Exam" },
  ];

  const filteredFiles = files.filter((file) => {
    const matchesTab = activeTab === "all" || file.type === activeTab;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const itemsPerPage = 4; 
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const getFileIcon = (type) => {
    switch (type) {
      case "resume": return <Briefcase className="h-4 w-4" />;
      case "Exam": return <BookOpen className="h-4 w-4" />;
      default: return <StickyNote className="h-4 w-4" />;
    }
  };

  const getFileColor = (type) => {
    switch (type) {
      case "resume": return "bg-pink-100 text-pink-600";
      case "Exam": return "bg-blue-100 text-blue-600";
      default: return "bg-yellow-100 text-yellow-600";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
            <h1 className="text-2xl font-bold">My Library</h1>
            <p className="text-muted-foreground">Manage and organize your uploaded documents.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['all', 'resume', 'Exam', 'note'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all whitespace-nowrap
                    ${activeTab === tab 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-card border border-border text-muted-foreground hover:bg-muted"
                    }`}
              >
                {tab === 'all' ? 'All Files' : tab + 's'}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-auto">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder={`Search inside ${activeTab === 'all' ? 'all files' : activeTab + 's'}...`} 
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">File Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Size</th>
                        <th className="px-6 py-4">Uploaded</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {paginatedFiles.length > 0 ? (
                      paginatedFiles.map((file) => (
                            <tr key={file.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-medium flex items-center gap-3">
                                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${getFileColor(file.type)}`}>
                                        {getFileIcon(file.type)}
                                    </div>
                                    {file.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                                        file.type === 'resume' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                        file.type === 'Exam' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}>
                                        {file.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{file.size}</td>
                                <td className="px-6 py-4 text-muted-foreground">{file.date}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button className="p-2 hover:bg-muted rounded text-muted-foreground transition" title="Download">
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 hover:bg-red-50 text-red-500 rounded transition" title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No {activeTab === 'all' ? 'files' : activeTab + 's'} found.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-border bg-background/50 flex items-center justify-end gap-2">
                <button
                  className="px-3 py-1 rounded-md border border-border bg-card hover:bg-muted"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md border ${currentPage === page ? 'bg-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="px-3 py-1 rounded-md border border-border bg-card hover:bg-muted"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}