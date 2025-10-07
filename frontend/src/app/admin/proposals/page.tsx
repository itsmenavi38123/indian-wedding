'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, FileText, Send, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { useGetAllProposals } from '@/services/api/proposal';
import { formatINR } from '@/lib/format';

export default function ProposalsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch proposals with filters
  const { data: proposals = [], isLoading } = useGetAllProposals(
    useMemo(() => {
      const params: any = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      return params;
    }, [statusFilter, searchQuery])
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { icon: Clock, text: 'Draft', className: 'bg-gray-100 text-gray-700' },
      SENT: { icon: Send, text: 'Sent', className: 'bg-blue-100 text-blue-700' },
      VIEWED: { icon: Eye, text: 'Viewed', className: 'bg-yellow-100 text-yellow-700' },
      ACCEPTED: { icon: CheckCircle, text: 'Accepted', className: 'bg-green-100 text-green-700' },
      REJECTED: { icon: XCircle, text: 'Rejected', className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        <Icon className="h-3 w-3" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
        <p className="text-gray-600 mt-2">Manage and track all your wedding proposals</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, title, or client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="VIEWED">Viewed</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading proposals...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proposals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No proposals found
                    </td>
                  </tr>
                ) : (
                  proposals.map((proposal: any) => (
                    <tr key={proposal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {proposal.reference}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{proposal.title}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{proposal.clientName}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(proposal.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {formatINR(proposal.grandTotal || 0)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{formatDate(proposal.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => router.push(`/admin/proposals/${proposal.id}/preview`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Proposals</p>
          <p className="text-2xl font-bold text-gray-900">{proposals.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-900">
            {proposals.filter((p: any) => p.status === 'DRAFT').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Sent</p>
          <p className="text-2xl font-bold text-blue-600">
            {proposals.filter((p: any) => p.status === 'SENT').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Accepted</p>
          <p className="text-2xl font-bold text-green-600">
            {proposals.filter((p: any) => p.status === 'ACCEPTED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-xl font-bold text-gray-900">
            {formatINR(proposals.reduce((sum: number, p: any) => sum + (p.grandTotal || 0), 0))}
          </p>
        </div>
      </div>
    </main>
  );
}
