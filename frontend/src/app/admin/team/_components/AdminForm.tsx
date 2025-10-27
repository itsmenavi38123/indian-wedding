'use client';

import React, { useEffect } from 'react';
import z from 'zod';
import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCreateAdminTeams } from '@/services/api/admin';

export const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
  members: z
    .array(
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      })
    )
    .nonempty('At least one member is required'),
});

export const adminSchema = z
  .object({
    teams: z.array(teamSchema).nonempty('At least one team is required'),
  })
  .superRefine((data, ctx) => {
    const allEmails: string[] = [];

    data.teams.forEach((team, tIndex) => {
      team.members.forEach((member, mIndex) => {
        const email = member.email.toLowerCase().trim();

        if (allEmails.includes(email)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['teams', tIndex, 'members', mIndex, 'email'],
            message: 'This member is already in this team',
          });
        } else {
          allEmails.push(email);
        }
      });
    });
  });

export type AdminFormValues = z.infer<typeof adminSchema>;

interface TeamProps {
  teamIndex: number;
}

const TeamForm: React.FC<TeamProps> = ({ teamIndex }) => {
  const { control } = useFormContext<AdminFormValues>();
  const {
    fields: memberFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({
    control,
    name: `teams.${teamIndex}.members`,
  });

  return (
    <div className="bg-black rounded-lg shadow p-6 mb-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">Team</h2>
      </div>

      {/* Team Name */}
      <FormField
        control={control}
        name={`teams.${teamIndex}.name`}
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-white">Team Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter team name" {...field} className="text-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Team Description */}
      <FormField
        control={control}
        name={`teams.${teamIndex}.description`}
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel className="text-white">Team Description</FormLabel>
            <FormControl>
              <Input placeholder="Enter team description" {...field} className="text-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Team Members */}
      <div className="mb-4">
        <FormLabel className="text-white mb-4">Team Members</FormLabel>
        {memberFields.map((member, mIndex) => (
          <div key={member.id} className="grid grid-cols-2 gap-2 items-center mb-2">
            <FormField
              control={control}
              name={`teams.${teamIndex}.members.${mIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Name" {...field} className="text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`teams.${teamIndex}.members.${mIndex}.email`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2 items-center">
                    <Input placeholder="Email" {...field} className="text-white" />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeMember(mIndex)}
                      disabled={memberFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => appendMember({ name: '', email: '' })}
          className="mt-2"
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Add Member
        </Button>
      </div>
    </div>
  );
};

interface AdminFormPageProps {
  defaultValues?: AdminFormValues;
  onSubmit?: (data: AdminFormValues) => void;
  mode?: 'add' | 'edit';
}

const AdminFormPage: React.FC<AdminFormPageProps> = ({ defaultValues, onSubmit, mode = 'add' }) => {
  const router = useRouter();
  const shouldInitialize = mode === 'add' || !!defaultValues;

  console.log('Constructed defaultValues:', defaultValues);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: shouldInitialize
      ? (defaultValues ?? {
          teams: [
            {
              name: '',
              description: '',
              members: [{ name: '', email: '' }],
            },
          ],
        })
      : undefined,
    mode: 'onBlur',
  });

  const { reset } = form;

  useEffect(() => {
    if (defaultValues) {
      console.log('Resetting form with:', defaultValues);

      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const {
    fields: teamFields,
    append: appendTeam,
    // remove: removeTeam,
  } = useFieldArray({
    control: form.control,
    name: 'teams',
  });

  const { mutate: createTeams } = useCreateAdminTeams();

  const handleSubmit = (data: AdminFormValues) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      createTeams(data, {
        onSuccess: () => router.push('/admin/team'),
        onError: (err) => console.error(err),
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="p-6 bg-black rounded-lg shadow space-y-6 max-w-5xl mx-auto"
      >
        {teamFields.map((team, tIndex) => (
          <TeamForm key={team.id ?? tIndex} teamIndex={tIndex} />
        ))}

        <div className="flex gap-4 justify-end">
          {mode === 'add' && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendTeam({ name: '', description: '', members: [{ name: '', email: '' }] })
              }
            >
              Add Team
            </Button>
          )}
          <Button type="submit">Save</Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default AdminFormPage;
