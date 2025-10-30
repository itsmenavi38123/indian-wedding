'use client';

import { useEffect, useState } from 'react';
import ProposalDocument from '@/components/proposals/ProposalDocument';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function ProposalViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProposal = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/proposals/${id}`
        );
        setProposal(res.data.data);
      } catch (error) {
        console.error('❌ Failed to fetch proposal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  useEffect(() => {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');

    if (header) header.style.display = 'none';
    if (nav) nav.style.display = 'none';
    if (footer) footer.style.display = 'none';

    return () => {
      if (header) header.style.display = '';
      if (nav) nav.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  console.log(proposal, 'proposal>>>>>>>>>>>>>>>>');
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading proposal...
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Proposal not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10">
      <ProposalDocument proposal={proposal} />
    </div>
  );
}
