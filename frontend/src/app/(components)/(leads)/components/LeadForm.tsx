'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  LEAD_SOURCE_VALUES,
  SAVED_STATUS_VALUES,
  SERVICE_TYPE_VALUES,
  ServiceType,
} from '@/types/lead/Lead';
import { useMutation } from '@tanstack/react-query';
import { createLead, CreateLeadPayload, updateLead } from '@/services/api/leads';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { locations } from '@/utils/data';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { RoleType } from '@/components/common/Header/Header';

const leadSchema = z.object({
  partner1Name: z.string().min(1, 'Partner 1 name is required'),
  partner2Name: z.string().min(1, 'Partner 2 name is required'),
  primaryContact: z.enum(['partner1', 'partner2']),
  phoneNumber: z.string().min(5, 'Phone number is required'),
  serviceTypes: z
    .string()
    .min(1, 'Select at least one service type')
    .refine(
      (val) => {
        const items = val.split(',').map((s) => s.trim());
        return items.every((item) => SERVICE_TYPE_VALUES.includes(item as ServiceType));
      },
      { message: 'Invalid service type selected' }
    ),
  whatsappNumber: z.string().optional(),
  whatsappNumberSameAsPhoneNumber: z.boolean().optional(),
  email: z.string().email(),
  weddingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid wedding date',
  }),
  flexibleDates: z.boolean().optional(),
  guestCount: z.tuple([z.number(), z.number()]),
  budget: z.tuple([z.number(), z.number()]),
  preferredLocations: z.array(z.string()).nonempty('At least one location must be provided'),
  leadSource: z.enum(LEAD_SOURCE_VALUES),
  saveStatus: z.enum(SAVED_STATUS_VALUES),
  referralDetails: z.string().optional(),
  initialNotes: z.string().optional(),
  createdById: z.string().uuid().optional(),
  weddingPlan: z
    .object({
      events: z
        .array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            date: z.string(),
            startTime: z.string(),
            endTime: z.string(),
          })
        )
        .optional(),
      services: z
        .array(
          z.object({
            id: z.string().optional(),
            vendorServiceId: z.string().uuid({ message: 'Vendor Service ID is required' }),
            category: z.string(),
            title: z.string(),
            description: z.string().optional(),
            price: z.number().optional(),
            vendorName: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface AddLeadProps {
  defaultValues?: Partial<LeadFormValues>;
  type?: 'add' | 'edit';
}

const LeadForm: React.FC<AddLeadProps> = ({ defaultValues, type = 'add' }) => {
  const [savedId, setSavedId] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth.user);
  const role = auth?.role as RoleType | null;
  const router = useRouter();
  const params = useParams();
  const { isPending: createLoading, mutate: createLeadMutate } = useMutation({
    mutationFn: (payload: CreateLeadPayload & { isUser: boolean }) => createLead(payload),
    onSuccess: (response, variables) => {
      setSavedId(response?.data?.id || null);
      if (variables.isUser) {
        router.back();
        toast.success(response?.data?.message || 'Lead saved successfully.');
      }
    },
    onError: (error: any) => {
      console.error('Create lead error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create lead. Please try again later.'
      );
    },
  });
  const [submitClicked, setSubmitClicked] = useState(false);

  const { isPending: updateLoading, mutate: updateLeadMutate } = useMutation({
    mutationFn: ({
      savedId,
      payload,
    }: {
      savedId: string;
      payload: CreateLeadPayload;
      isUser: boolean;
    }) => updateLead(savedId, payload),
    onSuccess: (response, variables) => {
      if (variables.isUser) {
        router.back();
        toast.success(response?.data?.message || 'Lead saved successfully.');
      }
    },
    onError: (error: any) => {
      console.error('Create lead error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create lead. Please try again later.'
      );
    },
  });

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      partner1Name: '',
      partner2Name: '',
      primaryContact: 'partner1',
      phoneNumber: '+91 ',
      whatsappNumber: '+91',
      whatsappNumberSameAsPhoneNumber: false,
      email: '',
      weddingDate: '',
      flexibleDates: false,
      guestCount: [50, 2000],
      budget: [500000, 20000000],
      preferredLocations: [],
      leadSource: 'WEBSITE',
      saveStatus: 'SUBMITTED',
      serviceTypes: 'Other',
      referralDetails: '',
      initialNotes: '',
      createdById: role === 'USER' ? (auth?.id ?? undefined) : undefined,
      weddingPlan: defaultValues?.weddingPlan || { events: [], services: [] },
      ...defaultValues,
    },
  });
  console.log('🚀 defaultValues received:', defaultValues);

  const watchLeadSource = form.watch('leadSource');
  const phoneNumber = form.watch('phoneNumber');
  const sameAsPhone = form.watch('whatsappNumberSameAsPhoneNumber') ?? false;

  useEffect(() => {
    if (sameAsPhone) {
      form.setValue('whatsappNumber', phoneNumber || '');
    }
  }, [phoneNumber, sameAsPhone, form]);

  useEffect(() => {
    if (type === 'edit' && params?.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setSavedId(id);
    }
  }, [type, params?.id]);
  console.log('🛠 Form initialized with values:', form.getValues());

  useEffect(() => {
    if (defaultValues) {
      console.log('API response weddingPlan.services:', defaultValues.weddingPlan?.services);
      //  const servicesWithVendorId = defaultValues.weddingPlan?.services?.map((s: any) => ({
      //   ...s,
      //   vendorServiceId: s.vendorService?.id ?? s.vendorServiceId ?? '', 
      // }));

      const servicesWithVendorId = defaultValues.weddingPlan?.services?.map((s: any) => ({
        ...s,
        vendorServiceId: '52c71fd6-d9eb-4d45-9a43-491031df9610',
      }));

      form.reset({
        partner1Name: defaultValues.partner1Name || '',
        partner2Name: defaultValues.partner2Name || '',
        primaryContact: defaultValues.primaryContact || 'partner1',
        phoneNumber: defaultValues.phoneNumber || '+91 ',
        whatsappNumber: defaultValues.whatsappNumber || '+91',
        whatsappNumberSameAsPhoneNumber: defaultValues.whatsappNumberSameAsPhoneNumber ?? false,
        email: defaultValues.email || '',
        weddingDate: defaultValues.weddingDate || '',
        flexibleDates: defaultValues.flexibleDates ?? false,
        guestCount: defaultValues.guestCount || [50, 2000],
        budget: defaultValues.budget || [500000, 20000000],
        preferredLocations: defaultValues.preferredLocations || [],
        leadSource: defaultValues.leadSource || 'WEBSITE',
        saveStatus: defaultValues.saveStatus || 'SUBMITTED',
        serviceTypes: defaultValues.serviceTypes || 'Other',
        referralDetails: defaultValues.referralDetails || '',
        initialNotes: defaultValues.initialNotes || '',
        createdById: defaultValues.createdById,
        weddingPlan: {
          ...defaultValues.weddingPlan,
          services: servicesWithVendorId,
        },
      });
    }
  }, [defaultValues, form]);

  useEffect(() => {
    if (type !== 'edit') return;
    const interval = setInterval(() => {
      const data = form.getValues();

      if (data.partner1Name === '' && data.partner2Name === '') {
        return;
      }


      const validServices = data.weddingPlan?.services?.filter(
        (service) => service.vendorServiceId
      );
      console.log('Services being sent to API:', validServices);

      const payload: CreateLeadPayload = {
        partner1Name: data.partner1Name,
        partner2Name: data.partner2Name,
        primaryContact: data.primaryContact,
        phoneNumber: data.phoneNumber,
        whatsappNumber: data.whatsappNumberSameAsPhoneNumber
          ? data.phoneNumber
          : data.whatsappNumber,
        whatsappNumberSameAsPhoneNumber: data.whatsappNumberSameAsPhoneNumber,
        email: data.email,
        serviceTypes: data.serviceTypes || '',
        weddingDate: data.weddingDate ? data.weddingDate : null,
        flexibleDates: data.flexibleDates,
        guestCountMin: data.guestCount?.[0],
        guestCountMax: data.guestCount?.[1],
        budgetMin: data.budget?.[0],
        budgetMax: data.budget?.[1],
        preferredLocations: data.preferredLocations,
        leadSource: data.leadSource,
        referralDetails: data.referralDetails,
        initialNotes: data.initialNotes,
        saveStatus: data.saveStatus,
        createdById: role === 'USER' ? auth?.id : undefined,
        weddingPlan: {
          ...data.weddingPlan,
          services: validServices || [],
        },
      };
      if (savedId) {
        updateLeadMutate({ savedId, payload, isUser: false });
      } else {
        createLeadMutate({ ...payload, isUser: false });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [form, savedId, createLeadMutate, updateLeadMutate, type, role, auth?.id]);

  const onSubmit = (data: LeadFormValues) => {
    setSubmitClicked(true);
    const normalizedServices = data.weddingPlan?.services?.map((s: any) => {
      const vendorServiceId = s.vendorServiceId || s.vendorService?.id;
      if (!vendorServiceId) return null; // skip invalid
      return {
        ...s,
        vendorServiceId,
      };
    }).filter(Boolean);
    const payload: CreateLeadPayload = {
      ...data,
      guestCountMin: data.guestCount?.[0],
      guestCountMax: data.guestCount?.[1],
      weddingPlan: {
        ...data.weddingPlan,
        services: normalizedServices,
        events: data.weddingPlan?.events || [],
      },
    };

    if (savedId) {
      updateLeadMutate({ savedId, payload, isUser: true });
    } else {
      createLeadMutate({ ...payload, isUser: true });
    }

    console.log('Payload sent to API:', payload);
  };


  console.log('WeddingPlan data:', form.watch('weddingPlan'));

  return (
    <div className="bg-black rounded-lg shadow p-2 xs:p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (data) => {
              console.log(' Submit clicked! Form data:', data);
              onSubmit(data);
            },
            (errors) => {
              console.log(' Validation errors:', errors);
            }
          )}
          className="grid md:grid-cols-2 gap-6"
        >
          <FormField
            control={form.control}
            name="partner1Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Partner 1 Name</FormLabel>
                <FormControl>
                  <Input className="text-white" placeholder="Enter partner 1 name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="partner2Name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Partner 2 Name</FormLabel>
                <FormControl>
                  <Input className="text-white" placeholder="Enter partner 2 name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Primary Contact Dropdown */}
          <FormField
            control={form.control}
            name="primaryContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Primary Contact Person</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full text-white">
                      <SelectValue className="text-white" placeholder="Select contact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="partner1">Partner 1</SelectItem>
                    <SelectItem value="partner2">Partner 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Phone Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d]/g, '');
                      if (!value.startsWith('91')) {
                        value = '91' + value.replace(/^91/, '');
                      }
                      value = '+91 ' + value.slice(2);
                      field.onChange(value);
                    }}
                    className="text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* WhatsApp Number + Same as phone */}
          <FormField
            control={form.control}
            name="whatsappNumber"
            render={({ field }) => {
              const sameAsPhone = form.watch('whatsappNumberSameAsPhoneNumber') ?? false;

              return (
                <FormItem>
                  <FormLabel className="text-white">WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input
                      className="text-white"
                      placeholder="Enter WhatsApp number"
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '');
                        if (!value.startsWith('91')) {
                          value = '91' + value.replace(/^91/, '');
                        }
                        value = '+91 ' + value.slice(2);
                        field.onChange(value);
                      }}
                      disabled={sameAsPhone}
                    />
                  </FormControl>

                  <label className="flex items-center space-x-2 mt-1 w-fit cursor-pointer select-none text-white">
                    <Checkbox
                      checked={sameAsPhone}
                      onCheckedChange={(checked: any) => {
                        const isChecked = checked === true;
                        form.setValue('whatsappNumberSameAsPhoneNumber', isChecked);

                        if (isChecked) {
                          form.setValue('whatsappNumber', form.watch('phoneNumber') || '');
                        }
                      }}
                    />
                    <span className="text-sm text-muted-foreground">Same as phone</span>
                  </label>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email Address</FormLabel>
                <FormControl>
                  {/* <Input type="email" {...field} onBlur={form.trigger("email")} /> */}
                  <Input className="text-white" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Wedding Date */}
          <FormField
            control={form.control}
            name="weddingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Wedding Date</FormLabel>
                <FormControl className="">
                  <input
                    className="text-white border border-white rounded-sm h-10 p-3"
                    type="date"
                    min={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
                    {...field}
                  />
                </FormControl>

                <label className="text-white flex items-center space-x-2 mt-1 w-fit cursor-pointer select-none">
                  <Checkbox
                    checked={form.watch('flexibleDates') ?? false}
                    onCheckedChange={(checked: any) =>
                      form.setValue('flexibleDates', checked === true)
                    }
                  />
                  <span className="text-sm  text-muted-foreground">Flexible Dates</span>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guests Slider */}
          <FormField
            control={form.control}
            name="guestCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Number of Guests</FormLabel>
                <FormControl>
                  <div>
                    <Slider
                      min={50}
                      max={2000}
                      step={10}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    {/* <div className="text-sm mt-2">{field.value[0]} - {field.value[1]}</div> */}
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min={50}
                        max={field.value[1]}
                        value={field.value[0]}
                        onChange={(e) => {
                          const newMin = Number(e.target.value) || 0;
                          field.onChange([newMin, field.value[1]]);
                        }}
                        className="text-white"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        min={field.value[0]}
                        max={2000}
                        value={field.value[1]}
                        onChange={(e) => {
                          const newMax = Number(e.target.value) || 0;
                          field.onChange([field.value[0], newMax]);
                        }}
                        className="text-white"
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Budget Slider + Presets */}
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Budget Range</FormLabel>
                <FormControl>
                  <div>
                    {/* Slider */}
                    <Slider
                      min={500000}
                      max={20000000}
                      step={1000}
                      value={field.value}
                      onValueChange={field.onChange}
                    />

                    {/* Display range */}
                    {/* <div className="text-sm mt-2">
                      ₹{field.value[0].toLocaleString()} - ₹{field.value[1].toLocaleString()}
                    </div> */}

                    {/* Manual input fields */}
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min={500000}
                        max={field.value[1]}
                        value={field.value[0]}
                        onChange={(e) => {
                          const newMin = Number(e.target.value) || 0;
                          field.onChange([newMin, field.value[1]]);
                        }}
                        className="text-white"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        min={field.value[0]}
                        max={20000000}
                        value={field.value[1]}
                        onChange={(e) => {
                          const newMax = Number(e.target.value) || 0;
                          field.onChange([field.value[0], newMax]);
                        }}
                        className="text-white"
                      />
                    </div>

                    {/* Quick select buttons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        [500000, 1000000],
                        [1000000, 2500000],
                        [2500000, 5000000],
                        [5000000, 20000000],
                      ].map((range, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          type="button"
                          onClick={() => field.onChange(range)}
                        >
                          ₹{range[0] / 100000}L - ₹{range[1] / 100000}L+
                        </Button>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredLocations"
            render={({ field }) => {
              const options = locations.map((loc) => ({
                label: loc,
                value: loc,
              }));

              return (
                <FormItem>
                  <FormLabel className="text-white">Preferred Locations</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <MultiSelect
                        options={options}
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Lead Source */}
          <FormField
            control={form.control}
            name="leadSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Lead Source</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl className="w-full text-white">
                    <SelectTrigger>
                      <SelectValue className="text-white" placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(LEAD_SOURCE_VALUES).map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {role !== 'USER' && (
            <FormField
              control={form.control}
              name="serviceTypes"
              render={({ field }) => {
                const options = SERVICE_TYPE_VALUES.map((type) => ({
                  label: type,
                  value: type,
                }));
                return (
                  <FormItem>
                    <FormLabel className="text-white">Service Types</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={options}
                        value={field.value.split(',')}
                        onChange={(newVal) => {
                          form.setValue('serviceTypes', (newVal as string[]).join(','), {
                            shouldDirty: true,
                          });
                        }}
                        dropdownClassName="max-h-100 overflow-auto hide-scrollbar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )}

          <FormField
            control={form.control}
            name="saveStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Save Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl className="w-full text-white">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SAVED_STATUS_VALUES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <>
            {/* Events Section */}
            {/* Editable Wedding Plan Section */}
            <div className="col-span-2 mt-6">
              <h3 className="text-xl font-semibold text-white mb-4">Wedding Plan</h3>

              {/* --- Events --- */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-2">Events</h4>
                {(() => {
                  const events = form.watch('weddingPlan.events') ?? [];
                  return events.length > 0 ? (
                    <div className="space-y-4">
                      {events.map((event, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-4">
                          <Input
                            className="mb-2 text-white"
                            placeholder="Event Name"
                            value={event.name}
                            onChange={(e) => {
                              const updated = [...events];
                              updated[index].name = e.target.value;
                              form.setValue('weddingPlan.events', updated);
                            }}
                          />
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="date"
                              className="text-white border border-white rounded-lg p-2 "
                              value={event.date}
                              onChange={(e) => {
                                const updated = [...events];
                                updated[index].date = e.target.value;
                                form.setValue('weddingPlan.events', updated);
                              }}
                            />
                            <input
                              type="time"
                              className="text-white border border-white rounded-lg p-2 "
                              value={event.startTime}
                              onChange={(e) => {
                                const updated = [...events];
                                updated[index].startTime = e.target.value;
                                form.setValue('weddingPlan.events', updated);
                              }}
                            />
                            <input
                              type="time"
                              className="text-white border border-white rounded-lg p-2 "
                              value={event.endTime}
                              onChange={(e) => {
                                const updated = [...events];
                                updated[index].endTime = e.target.value;
                                form.setValue('weddingPlan.events', updated);
                              }}
                            />
                            <Button
                              variant="default"
                              size="sm"
                              className="mt-3"
                              onClick={() => {
                                const updated = events.filter((_, i) => i !== index);
                                form.setValue('weddingPlan.events', updated);
                              }}
                            >
                              <Trash2 />{' '}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No events added yet.</p>
                  );
                })()}

                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    const current = form.getValues('weddingPlan.events') || [];
                    form.setValue('weddingPlan.events', [
                      ...current,
                      { name: '', date: '', startTime: '', endTime: '' },
                    ]);
                  }}
                >
                  + Add Event
                </Button>
              </div>
            </div>

            {/* Services Section */}
            <div className="col-span-2 mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Selected Services</h3>
              {(() => {
                const services = form.watch('weddingPlan.services') ?? [];
                return services.length > 0 ? (
                  <div className="space-y-2">
                    {services.map((service, index) => (
                      <div key={index} className="border rounded-lg p-3 text-white">
                        <p className="font-medium">{service.category}</p>
                        <p className="text-sm text-muted-foreground">{service.title}</p>
                        <p className="text-sm">Vendor: {service.vendorName || 'N/A'}</p>
                        <p className="text-sm">₹{service.price?.toLocaleString() || '—'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No services selected yet.</p>
                );
              })()}
            </div>
          </>

          {/* Referral Details conditional */}
          {watchLeadSource === 'REFERRAL' && (
            <FormField
              control={form.control}
              name="referralDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Referral Details</FormLabel>
                  <FormControl className="text-white">
                    <Input {...field} placeholder="Who referred?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Initial Notes */}
          <FormField
            control={form.control}
            name="initialNotes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-white">Initial Notes</FormLabel>
                <FormControl className="text-white">
                  <Textarea placeholder="Enter notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="md:col-span-2 flex flex-col xs:flex-row items-center justify-between mt-6 gap-2">
            {type === 'add' ? (
              <Button type="button" variant="outline" className="w-full xs:w-auto">
                Save as Draft
              </Button>
            ) : (
              <div></div>
            )}
            <div className="flex flex-col xs:flex-row w-full xs:w-auto items-center gap-4 ">
              <Button
                disabled={createLoading || updateLoading}
                type="submit"
                className="w-full xs:w-auto"
              >
                {createLoading || updateLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : type === 'edit' ? (
                  'Update Lead'
                ) : (
                  'Create Lead'
                )}
              </Button>
              <button
                type="button"
                className="text-white cursor-pointer underline text-sm w-full xs:w-auto"
              >
                {type === 'edit' ? 'Update & Add Another' : 'Create & Add Another'}
              </button>
            </div>

            {submitClicked && <div className="text-green-500 mt-2">Form Submitted!</div>}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LeadForm;
