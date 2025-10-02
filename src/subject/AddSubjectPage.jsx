import { useState } from "react";
import { SubjectApi } from "@/lib/endpoints";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Layers, FileText, Upload } from "lucide-react";

export default function AddSubjectPage() {
  const [form, setForm] = useState({
    standard: "",
    division: "",
    subjectName: "",
    pdf: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdSubject, setCreatedSubject] = useState(null);

  const handleSubmit = async () => {
    setMessage("");
    setError("");
    setCreatedSubject(null);
    
    // Basic validation
    if (!form.standard || !form.division || !form.subjectName) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!form.pdf) {
      setError("Please select a PDF file to upload");
      return;
    }

    const data = new FormData();
    data.append("standard", form.standard);
    data.append("division", form.division);
    data.append("subjectName", form.subjectName);
    data.append("pdf", form.pdf);

    try {
      setLoading(true);
      const res = await SubjectApi.addSubject(data);
      
      if (res.data.success) {
        setMessage(res.data.message);
        setCreatedSubject(res.data.data);
        // Reset form after successful submission
        setForm({
          standard: "",
          division: "",
          subjectName: "",
          pdf: null,
        });
      } else {
        setError(res.data.message || "Failed to add subject");
      }
    } catch (err) {
      setError(err.response?.data?.message || "❌ Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-6">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-6 animate-fade-in">
        <CardHeader>
          <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            Add Subject ✨
          </h1>
          <p className="text-center text-purple-200 mt-2 text-sm">
            Fill in the details to upload subject resources
          </p>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-purple-200">
                <Layers className="w-4 h-4" /> Standard
              </Label>
              <Input
                placeholder="Enter Standard (e.g. 9)"
                value={form.standard}
                onChange={(e) => setForm({ ...form, standard: e.target.value })}
                className="bg-gray-900/60 border border-purple-600 text-white placeholder-purple-400 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-purple-200">
                <BookOpen className="w-4 h-4" /> Division
              </Label>
              <Input
                placeholder="Enter Division (e.g. A)"
                value={form.division}
                onChange={(e) => setForm({ ...form, division: e.target.value })}
                className="bg-gray-900/60 border border-purple-600 text-white placeholder-purple-400 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-purple-200">
                <FileText className="w-4 h-4" /> Subject Name
              </Label>
              <Input
                placeholder="Enter Subject Name"
                value={form.subjectName}
                onChange={(e) =>
                  setForm({ ...form, subjectName: e.target.value })
                }
                className="bg-gray-900/60 border border-purple-600 text-white placeholder-purple-400 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-purple-200">
                <Upload className="w-4 h-4" /> Upload PDF
              </Label>
              <Input
                type="file"
                onChange={(e) =>
                  setForm({ ...form, pdf: e.target.files?.[0] || null })
                }
                className="bg-gray-900/60 border border-purple-600 text-white file:text-purple-400 file:font-semibold file:bg-purple-900/30 file:border-none file:rounded-md hover:file:bg-purple-800/40 transition-all"
              />
            </div>

            <Button
              disabled={loading}
              type="submit"
              className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 rounded-lg shadow-lg transition duration-300 transform hover:scale-[1.02]"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>

          {message && createdSubject && (
            <Alert className="mt-5 bg-green-100 border-green-500 text-green-800 font-semibold animate-fade-in">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-bold">✅ {message}</p>
                  <div className="text-sm bg-green-50 p-3 rounded border">
                    <p><strong>Subject ID:</strong> {createdSubject.subjectId}</p>
                    <p><strong>Name:</strong> {createdSubject.subjectName}</p>
                    <p><strong>Class:</strong> {createdSubject.standard}-{createdSubject.division}</p>
                    <p><strong>Created:</strong> {new Date(createdSubject.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="mt-5 bg-red-100 border-red-500 text-red-800 font-semibold animate-fade-in">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
