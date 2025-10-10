'use client';

import React, { useEffect } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormFieldWrapper } from './FormFieldWrapper';
import { vendorSchemaAdd, vendorSchemaEdit, VendorFormProps } from '@/types/vendor/Vendor';
import { createVendor, updateVendor } from '@/services/api/vendors';
import { Team } from './TeamFields';
import { UserPlus } from 'lucide-react';
import { SERVICE_TYPE_VALUES } from '@/types/lead/Lead';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { addVendor, setLoading, updateVendorInStore } from '@/store/slices/vendor';
import { countryCodes } from '@/utils/data';

export const VendorForm: React.FC<VendorFormProps> = ({
  defaultValues,
  type = 'add',
  vendorId,
  readOnly = false,
}) => {
  const router = useRouter();
  const schema = type === 'add' ? vendorSchemaAdd : vendorSchemaEdit;
  const dispatch = useDispatch<AppDispatch>();

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      contactNo: '',
      countryCode: '+91',
      serviceTypes: '',
      minimumAmount: 0,
      maximumAmount: 0,
      isActive: true,
      teams: [],
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (defaultValues) {
      // Process default values to handle avatar states properly
      const processedValues = {
        ...defaultValues,
        teams: (defaultValues.teams || []).map((team: any) => ({
          ...team,
          members: (team.members || []).map((member: any) => ({
            ...member,
            // Clean up "null" strings and set proper avatar state
            avatar: member.avatar === 'null' ? null : member.avatar,
            avatarPreview: '', // Clear preview for existing data
            // Add flag to track if this is an existing member
            isExisting: !!member.id && member.id !== 'temp',
          })),
        })),
      };
      form.reset(processedValues);
    }
  }, [defaultValues, form]);

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
  } = useFieldArray({
    control: form.control,
    name: 'teams',
  });

  const onSubmit = async (data: any) => {
    const vendorEmail = data.email?.trim().toLowerCase();
    const memberEmails: string[] = [];
    (data.teams || []).forEach((team: any) => {
      (team.members || []).forEach((member: any) => {
        if (member.email) {
          memberEmails.push(member.email.trim().toLowerCase());
        }
      });
    });
    const duplicateEmails = memberEmails.filter(
      (email, idx) => memberEmails.indexOf(email) !== idx
    );

    if (duplicateEmails.length > 0) {
      toast.error(
        `Duplicate team member emails found: ${[...new Set(duplicateEmails)].join(', ')}`
      );
      return;
    }
    if (memberEmails.includes(vendorEmail)) {
      toast.error('Vendor email cannot be the same as a team member email');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    if (data.password) formData.append('password', data.password);
    formData.append('contactNo', data.contactNo);
    formData.append('countryCode', data.countryCode);
    formData.append('minimumAmount', String(data.minimumAmount));
    formData.append('maximumAmount', String(data.maximumAmount));
    formData.append('isActive', String(data.isActive));
    formData.append(
      'serviceTypes',
      Array.isArray(data.serviceTypes) ? data.serviceTypes.join(',') : data.serviceTypes
    );

    (data.teams || []).forEach((team: any, tIndex: number) => {
      formData.append(`teams[${tIndex}][id]`, team.id || 'temp');
      formData.append(`teams[${tIndex}][name]`, team.name || '');
      formData.append(`teams[${tIndex}][description]`, team.description || '');
      (team.members || []).forEach((member: any, mIndex: number) => {
        formData.append(`teams[${tIndex}][members][${mIndex}][id]`, member.id || 'temp');
        formData.append(`teams[${tIndex}][members][${mIndex}][name]`, member.name || '');
        formData.append(`teams[${tIndex}][members][${mIndex}][role]`, member.role || '');
        formData.append(`teams[${tIndex}][members][${mIndex}][email]`, member.email || '');
        formData.append(`teams[${tIndex}][members][${mIndex}][phone]`, member.phone || '');
        if (member.avatar instanceof File) {
          formData.append(`teams[${tIndex}][members][${mIndex}][avatarFile]`, member.avatar);
        } else if (member.avatar === null && member.isExisting) {
          formData.append(`teams[${tIndex}][members][${mIndex}][deleteAvatar]`, 'true');
        } else if (typeof member.avatar === 'string' && member.avatar && member.avatar !== 'null') {
          formData.append(`teams[${tIndex}][members][${mIndex}][existingAvatar]`, member.avatar);
        }
      });
    });

    dispatch(setLoading(true));
    try {
      if (type === 'edit' && vendorId) {
        const updatedVendor = await updateVendor(vendorId, formData);
        dispatch(updateVendorInStore(updatedVendor));
        toast.success('Vendor updated successfully');
      } else {
        const newVendor = await createVendor(formData);
        dispatch(addVendor(newVendor));
        toast.success('Vendor created successfully');
      }
      router.push('/admin/vendors');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save vendor. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
          (data) => onSubmit(data),
          (errors) => console.log('Validation errors', errors)
        )}
        className="space-y-6 p-6 rounded-lg shadow bg-black"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <FormFieldWrapper name="name" label="Vendor Name" disabled={readOnly} />
          <FormFieldWrapper name="email" label="Email" type="email" disabled={readOnly} />
          {!readOnly && (
            <FormFieldWrapper
              name="password"
              label="Password"
              type="password"
              placeholder={
                type === 'add' ? 'Enter your password' : 'Keep empty for existing password'
              }
              disabled={readOnly}
            />
          )}
          <FormFieldWrapper
            name="countryCode"
            label="Country Code"
            type="select"
            disabled={readOnly}
            options={countryCodes.map((c) => ({ label: `${c.name} (${c.code})`, value: c.code }))}
          />
          <FormFieldWrapper name="contactNo" label="Phone" type="tel" disabled={readOnly} />
          <FormFieldWrapper
            name="minimumAmount"
            label="Minimum Amount"
            type="number"
            disabled={readOnly}
          />
          <FormFieldWrapper
            name="maximumAmount"
            label="Maximum Amount"
            type="number"
            disabled={readOnly}
          />
          <FormFieldWrapper
            name="serviceTypes"
            label="Service Types"
            isMultiSelect
            disabled={readOnly}
            options={SERVICE_TYPE_VALUES.map((v) => ({ label: v, value: v }))}
          />
        </div>

        {!readOnly && (
          <div className="space-y-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-2xl font-bold text-white">Teams</h1>
              <Button
                variant="ghost"
                className="text-black bg-white"
                type="button"
                onClick={() =>
                  appendTeam({
                    id: 'temp',
                    name: `Team ${teamFields.length + 1}`,
                    description: '',
                    members: [],
                  })
                }
              >
                <UserPlus />
              </Button>
            </div>
            {teamFields.map((team, tIndex) => (
              <Team key={team.id ?? tIndex} teamIndex={tIndex} removeTeam={removeTeam} />
            ))}
          </div>
        )}

        {!readOnly && (
          <div className="flex justify-end mt-6">
            <Button variant="ghost" className="text-black bg-white" type="submit">
              Save Vendor
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};
