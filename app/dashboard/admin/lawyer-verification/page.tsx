"use client";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type Lawyer = {
  userId: string;
  name: string;
  email: string;
};

export default function LawyerVerificationDashboard() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all lawyers who are not verified
    async function fetchLawyers() {
      setLoading(true);
      const res = await fetch('/api/admin/unverified-lawyers');
      const data = await res.json();
      setLawyers(data.lawyers || []);
      setLoading(false);
    }
    fetchLawyers();
  }, []);

  async function verifyLawyer(userId: string) {
    setLoading(true);
    await fetch('/api/admin/verify-lawyer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lawyerUserId: userId }),
    });
    setLawyers(lawyers.filter(lawyer => lawyer.userId !== userId));
    setLoading(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Lawyer Verification</h1>
      {loading && <p>Loading...</p>}
      <ul>
        {lawyers.map(lawyer => (
          <li key={lawyer.userId} className="mb-4 flex items-center justify-between">
            <span>{lawyer.name} ({lawyer.email})</span>
            <Button onClick={() => verifyLawyer(lawyer.userId)}>
              Verify
            </Button>
          </li>
        ))}
      </ul>
      {lawyers.length === 0 && !loading && <p>All lawyers are verified!</p>}
    </div>
  );
}
