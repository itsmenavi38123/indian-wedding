'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, UserX, UsersRound } from 'lucide-react';
import { FormFieldWrapper } from './FormFieldWrapper';
import { BASE_URL } from '@/lib/constant';
import { toast } from 'sonner';
import Image from 'next/image';

interface TeamProps {
  teamIndex: number;
  removeTeam: (index: number) => void;
}

export const Team: React.FC<TeamProps> = ({ teamIndex, removeTeam }) => {
  const { control, setValue, watch } = useFormContext();
  const [open, setOpen] = useState(true);
  const [memberOpen, setMemberOpen] = useState<boolean[]>([]);

  const members = useWatch({ control, name: `teams.${teamIndex}.members` }) || [];

  const {
    fields: memberFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({
    control,
    name: `teams.${teamIndex}.members`,
  });

  useEffect(() => {
    setMemberOpen(memberFields.map(() => true));
  }, [memberFields]);

  const getAvatarUrl = (mIndex: number) => {
    const member = members[mIndex];
    if (!member) return null;

    // Priority: avatarPreview (new upload) > avatar (existing file/string)
    if (member.avatarPreview) {
      return member.avatarPreview;
    }

    // Handle avatar string values
    if (typeof member.avatar === 'string' && member.avatar && member.avatar !== 'null') {
      // If it's a path starting with /uploads, prepend BASE_URL
      if (member.avatar.startsWith('/uploads')) {
        return `${BASE_URL}${member.avatar}`;
      }
      // If it's already a full URL, use as is
      return member.avatar;
    }

    return null;
  };

  const handleAvatarUpload = (mIndex: number, file: File) => {
    const member = members[mIndex];

    // Clean up any existing preview URL to prevent memory leaks
    if (member?.avatarPreview) {
      URL.revokeObjectURL(member.avatarPreview);
    }

    // Set the file object for form submission
    setValue(`teams.${teamIndex}.members.${mIndex}.avatar`, file);
    // Set preview URL for display
    setValue(`teams.${teamIndex}.members.${mIndex}.avatarPreview`, URL.createObjectURL(file));
  };

  const handleAvatarRemove = (mIndex: number) => {
    const member = members[mIndex];

    // Clean up preview URL if it exists
    if (member?.avatarPreview) {
      URL.revokeObjectURL(member.avatarPreview);
    }

    // Set avatar to null for existing members (indicates deletion), undefined for new members
    setValue(`teams.${teamIndex}.members.${mIndex}.avatar`, member?.isExisting ? null : undefined);
    setValue(`teams.${teamIndex}.members.${mIndex}.avatarPreview`, '');
  };

  const addNewMember = () => {
    const newMember = {
      id: 'temp',
      name: `Team Member ${memberFields.length + 1}`,
      role: '',
      email: '',
      phone: '',
      avatar: undefined, // Undefined for new members (not null)
      avatarPreview: '',
      isExisting: false, // This is a new member
    };

    appendMember(newMember);
    setMemberOpen((prev) => [...prev, true]);
  };

  const removeMemberHandler = (mIndex: number) => {
    const member = members[mIndex];

    // Clean up preview URL if it exists
    if (member?.avatarPreview) {
      URL.revokeObjectURL(member.avatarPreview);
    }

    removeMember(mIndex);
    setMemberOpen((prev) => prev.filter((_, i) => i !== mIndex));
  };

  const teamName = watch(`teams.${teamIndex}.name`) || `Team ${teamIndex + 1}`;

  return (
    <div className="border rounded-lg p-4 shadow-md space-y-4">
      <div className="flex items-center justify-between cursor-pointer">
        <h3 className="text-lg font-semibold">{teamName}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" type="button" onClick={() => setOpen(!open)}>
            {open ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={() => removeTeam(teamIndex)}
          >
            <UserX />
          </Button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 mt-2">
          <div className="grid md:grid-cols-2 gap-4">
            <FormFieldWrapper name={`teams.${teamIndex}.name`} label="Team Name" />
            <FormFieldWrapper name={`teams.${teamIndex}.description`} label="Description" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-md">Team Members</h4>
              <Button type="button" onClick={addNewMember}>
                <UsersRound className="mr-1" /> Add Member
              </Button>
            </div>

            {memberFields.map((member, mIndex) => {
              const memberName = members[mIndex]?.name || `Team Member ${mIndex + 1}`;
              const avatarUrl = getAvatarUrl(mIndex);
              const hasAvatar = !!avatarUrl;

              return (
                <div
                  key={member.id ?? mIndex}
                  className="p-4 bg-white border rounded-lg shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between cursor-pointer">
                    <h5 className="font-medium text-md">{memberName}</h5>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => {
                          setMemberOpen((prev) => {
                            const copy = [...prev];
                            copy[mIndex] = !copy[mIndex];
                            return copy;
                          });
                        }}
                      >
                        {memberOpen[mIndex] ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        type="button"
                        onClick={() => removeMemberHandler(mIndex)}
                      >
                        <UserX />
                      </Button>
                    </div>
                  </div>

                  {memberOpen[mIndex] && (
                    <div className="space-y-3 mt-2">
                      {/* Avatar Section */}
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <div className="w-24 h-24 rounded-full overflow-hidden border flex items-center justify-center bg-gray-100">
                            {hasAvatar ? (
                              <Image
                                src={avatarUrl}
                                alt={`${memberName} avatar`}
                                className="w-full h-full object-cover"
                                width={96}
                                height={96}
                                onError={(e) => {
                                  console.warn('Avatar failed to load:', avatarUrl);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-gray-400 text-sm text-center px-2">
                                No Avatar
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-center gap-4">
                          <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                            {hasAvatar ? 'Change' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (!file.type.startsWith('image/')) {
                                    toast.warning('Please select a valid image file.');
                                    return;
                                  }
                                  handleAvatarUpload(mIndex, file);
                                }
                                e.target.value = '';
                              }}
                            />
                          </label>

                          {hasAvatar && (
                            <button
                              type="button"
                              className="text-sm text-red-500 hover:underline"
                              onClick={() => handleAvatarRemove(mIndex)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Member Details */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormFieldWrapper
                          name={`teams.${teamIndex}.members.${mIndex}.name`}
                          label="Name"
                          required
                        />
                        <FormFieldWrapper
                          name={`teams.${teamIndex}.members.${mIndex}.role`}
                          label="Role"
                        />
                        <FormFieldWrapper
                          name={`teams.${teamIndex}.members.${mIndex}.email`}
                          label="Email"
                          type="email"
                          required
                        />
                        <FormFieldWrapper
                          name={`teams.${teamIndex}.members.${mIndex}.phone`}
                          label="Phone"
                          type="tel"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
