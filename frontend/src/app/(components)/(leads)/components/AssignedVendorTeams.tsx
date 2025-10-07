import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import Link from 'next/link';

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface Team {
  id: string;
  name: string;
  teamMembers: TeamMember[];
}

interface Card {
  vendorEmail: string;
  countryCode: string;
  contactNo: string;
  id: string;
  vendorName: string;
  teams: Team[];
  vendorId: string;
}

interface Props {
  cards: Card[];
  readOnly?: boolean;
}

export const AssignedVendorTeams: React.FC<Props> = ({ cards, readOnly = false }) => {
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({});
  const toggleTeam = (cardId: string, teamId: string) => {
    const key = `${cardId}_${teamId}`;
    setOpenTeams((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {cards.map((card) => (
        <div key={card.id} className="border rounded p-6 shadow-md bg-white">
          <div className="flex justify-between  mb-4">
            <div className="space-y-2  flex justify-between space-x-44">
              <div>
                <p className="text-sm text-gray-500">Vendor Name</p>
                <h2 className="text-lg font-semibold">{card.vendorName}</h2>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendor Email</p>
                <p className="text-md">{card.vendorEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-md">
                  {card.countryCode} {card.contactNo}
                </p>
              </div>
            </div>

            <Link href={`/admin/vendors/${card.vendorId}`}>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  title={`View Vendor ${card.vendorName}`}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </Link>
          </div>

          {card.teams.length === 0 ? (
            <div className="italic text-muted-foreground">No teams assigned</div>
          ) : (
            <div className="space-y-6">
              {card.teams.map((team) => {
                const teamKey = `${card.id}_${team.id}`;
                const isOpen = openTeams[teamKey] ?? true;

                return (
                  <div key={team.id} className="border rounded-lg p-4 shadow-sm">
                    {/* Team Header with toggle */}
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleTeam(card.id, team.id)}
                    >
                      <h3 className="text-lg font-semibold">{team.name}</h3>
                      <Button variant="outline" size="sm" type="button" className="cursor-pointer">
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </div>

                    {/* Team Members Grid */}
                    {isOpen && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full table-auto border-collapse text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border px-4 py-2 text-left">Name</th>
                              <th className="border px-4 py-2 text-left">Email</th>
                              <th className="border px-4 py-2 text-left">Role</th>
                              <th className="border px-4 py-2 text-left">Phone</th>
                            </tr>
                          </thead>
                          <tbody>
                            {team.teamMembers.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="italic text-muted-foreground p-4 text-center"
                                >
                                  No members assigned
                                </td>
                              </tr>
                            ) : (
                              team.teamMembers.map((member) => (
                                <tr key={member.id} className="border-t">
                                  <td className="border px-4 py-2">{member.name}</td>
                                  <td className="border px-4 py-2">{member.email || '-'}</td>
                                  <td className="border px-4 py-2">{member.role || '-'}</td>
                                  <td className="border px-4 py-2">{member.phone || '-'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
