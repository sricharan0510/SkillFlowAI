import DashboardLayout from "../../components/interactive/DashboardLayout";

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-card border border-border rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">AI Exams</h2>
          <p className="text-muted-foreground text-sm">Generate domain-specific practice exams from your materials.</p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Summaries & Notes</h2>
          <p className="text-muted-foreground text-sm">Quick revision with AI-generated summaries and flashcards.</p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Mock Interviews</h2>
          <p className="text-muted-foreground text-sm">Personalized interview practice tailored to your resume.</p>
        </div>

      </div>
    </DashboardLayout>
  );
}
