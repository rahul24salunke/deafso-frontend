import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardApi } from '@/lib/endpoints';

export default function ClassStudentsPage() {
  const { standard, division } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await DashboardApi.getStudentsInClass(standard, division);
        const list = res.data?.data || res.data?.students || res.data;
        setStudents(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    if (standard && division) fetchStudents();
  }, [standard, division]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Class Students</h1>
      <p className="mb-4">Standard: <strong>{standard}</strong> | Division: <strong>{division}</strong></p>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <ul className="list-disc pl-6">
          {students.map((s, idx) => (
            <li key={s.id || idx}>{s.fullname || s.name || JSON.stringify(s)}</li>
          ))}
          {students.length === 0 && <li>No students found</li>}
        </ul>
      )}
    </div>
  );
}


