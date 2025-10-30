'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProposalTemplate } from '@/services/api/proposalTemplate';
import { ClientDetails, HeaderSection } from './components/header-section';
import { Service, ServicesSection } from './components/services-section';
import { PricingTable } from './components/pricing-table';
import { VersionEntry, VersionHistoryModal } from './components/version-history';
import { TemplateGallery } from './components/template-gallery';
import { IntroSection } from './components/intro-section';
import { useGetAllVendorsForLead, useGetLead } from '@/services/api/leads';
import { toast } from 'sonner';
import { TermsSection } from './components/terms-section';
import {
  useSaveProposalDraft,
  useGetProposalDraft,
  useFinalizeProposal,
  useSaveProposalVersion,
} from '@/services/api/proposal';
import { useGetAllTemplates } from '@/services/api/proposalTemplate';
import { EventsSection } from './components/event-section';
import { BudgetSection } from './components/budget-section';
import { Button } from '@/components/ui/button';
import VendorAssignmentView from '@/app/(components)/(leads)/components/VendorAssignmentView';

type ProposalState = {
  templateId: string;
  templateName: string;
  companyName: string;
  logoUrl?: string;
  title: string;
  dateISO: string;
  reference: string;
  client: ClientDetails;
  introHTML: string;
  services: Service[];
  taxesPercent: number;
  discount: number;
  paymentTerms: string;
  termsText: string;
  budget?: [number, number];
  stage?: string;
  events?: {
    id: string;
    name: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
  }[];
  weddingPlanId?: string;
};

type Stored = {
  state: ProposalState;
  versions: { id: string; timestamp: number; snapshot: ProposalState }[];
  lastSavedAt?: number;
};

export default function CreateProposalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = params?.id || 'unknown';
  const proposalIdRef = useRef<string | null>(null);
  const [lastBackendSave, setLastBackendSave] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const [versions, setVersions] = useState<VersionEntry[]>([]);

  const [selectedService, setSelectedService] = useState<any>(null);
  const [showVendorAssignModal, setShowVendorAssignModal] = useState(false);

  const { data: availableVendors, isLoading: isVendorsLoading } = useGetAllVendorsForLead(
    showVendorAssignModal ? leadId : undefined
  );

  const handleAssignVendor = (category: string) => {
    setSelectedService(category);
    setShowVendorAssignModal(true);
  };

  // Calculate grand total for a given state
  const calculateGrandTotal = (state: ProposalState) => {
    const subtotal = state.services.reduce((sum, service) => sum + service.price, 0);
    const taxable = Math.max(0, subtotal - state.discount);
    const tax = taxable * (state.taxesPercent / 100);
    return Math.max(0, taxable + tax);
  };
  // Hooks for API operations
  const { data: draftResponse, isLoading: isLoadingDraft } = useGetProposalDraft(leadId);
  const { data: templates = [], isLoading: isLoadingTemplates } = useGetAllTemplates();
  const saveProposalMutation = useSaveProposalDraft();
  const finalizeProposalMutation = useFinalizeProposal();
  const saveVersionMutation = useSaveProposalVersion();
  const [templateInitialized, setTemplateInitialized] = useState(false);

  const { data: leadData, isLoading: isLoadingLead } = useGetLead(leadId);
  const acceptedVendorsByCategory = leadData?.data?.weddingPlan?.services?.reduce(
    (acc: any, s: any) => {
      const vs = s.vendorService;
      console.log(
        'Vendor Service sample:',
        leadData?.data?.weddingPlan?.services?.[0]?.vendorService
      );

      const vendor = vs?.vendor;

      const category = vs?.category || 'Other';
      if (!vendor) return acc;

      if (!acc[category]) {
        acc[category] = { category, vendors: [] };
      }

      if (s.status === 'ACCEPTED') {
        acc[category].vendors.push(vendor);
      }

      return acc;
    },
    {}
  );

  const [data, setData] = useState<Stored>(() => {
    return {
      state: {
        templateId: 'classic',
        templateName: 'Classic Elegant',
        companyName: 'Acme Weddings',
        logoUrl: '',
        title: 'Classic Elegant Proposal',
        dateISO: '',
        reference: '',
        client: { name: '', email: '', phone: '', address: '' },
        introHTML: '',
        services: [],
        taxesPercent: 18,
        discount: 0,
        paymentTerms: '50% to book, 50% before event',
        termsText: '',
        budget: undefined,
        stage: '',
        events: [],
        weddingPlanId: '',
      },
      versions: [],
      lastSavedAt: undefined,
    };
  });

  const saveVersionToBackend = useCallback(
    async (snapshot: ProposalState, isManual: boolean = false) => {
      if (!proposalIdRef.current) return;
      try {
        const grandTotal = calculateGrandTotal(snapshot);
        const versionData = {
          snapshot: {
            ...snapshot,
            grandTotal,
            timestamp: Date.now(),
            isManual,
          },
        };

        await saveVersionMutation.mutateAsync({
          proposalId: proposalIdRef.current,
          snapshot: versionData.snapshot,
        });

        const newVersion: VersionEntry = {
          id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          snapshot: { ...snapshot, grandTotal },
        };

        setVersions((prev) => [newVersion, ...prev.slice(0, 19)]);
      } catch (error) {
        console.error('Failed to save version:', error);
      }
    },
    [saveVersionMutation]
  );
  console.log('💡 Sample lead service:', leadData?.data?.weddingPlan?.services?.[0]);

  useEffect(() => {
    if (draftResponse?.data && leadData?.data) {
      const draft = draftResponse.data;
      proposalIdRef.current = draft.id;
      const lead = leadData?.data;
      const restoredState: ProposalState = {
        templateId: draft.template,
        templateName: draft.title.replace(' Proposal', ''),
        companyName: draft.companyName,
        logoUrl: draft.logoUrl,
        title: draft.title,
        dateISO: draft.dateISO,
        reference: draft.reference,
        client: {
          name: draft.clientName,
          email: draft.clientEmail || '',
          phone: draft.clientPhone || '',
          address: draft.clientAddress || '',
        },
        introHTML: draft.introHTML,
        services: draft.services?.length
          ? draft.services.map((s: any) => ({
              id: s.id,
              name: s.name,
              description: s.description || '',
              price: s.price,
              category: s.category || s.vendorService?.serviceType || 'Other',
              vendorId: s.vendorId || s.vendor?.id || s.vendorService?.vendor?.id,
              vendor: s.vendor || s.vendorService?.vendor || null,
            }))
          : lead?.weddingPlan?.services?.map((srv: any) => ({
              id: srv.id,
              name: srv.vendorService?.title || 'Unnamed Service',
              description: srv.vendorService?.description || srv.notes || '',
              price: srv.vendorService?.price || 0,
              category: srv.vendorService?.serviceType || 'Other',
              vendorId: srv.vendorService?.vendor?.id,
              vendor: srv.vendorService?.vendor || null,
            })) || [],

        taxesPercent: draft.taxesPercent,
        discount: draft.discount,
        paymentTerms: draft.paymentTerms,
        termsText: draft.termsText,
        budget: draft.budget ?? [
          lead?.budgetMin ?? lead?.weddingPlan?.totalBudget ?? 0,
          lead?.budgetMax ?? lead?.weddingPlan?.totalBudget ?? 0,
        ],
        stage: draft.stage ?? lead?.stage ?? lead?.status ?? '',

        events: draft.events?.length
          ? draft.events
          : lead?.weddingPlan?.events?.map((e: any) => ({
              id: e.id,
              name: e.name,
              date: e.date ? e.date.split('T')[0] : '',
              startTime: e.startTime || '',
              endTime: e.endTime || '',
              location: e.location || lead?.weddingPlan?.destination?.name || '',
            })) || [],

        weddingPlanId: lead?.weddingPlanId || '',
      };

      const loadedVersions =
        draft.versions?.map((v: any) => ({
          id: v.id,
          timestamp: new Date(v.createdAt).getTime(),
          snapshot: v.snapshot,
        })) || [];
      setData({
        state: restoredState,
        versions: loadedVersions,
        lastSavedAt: new Date(draft.updatedAt).getTime(),
      });

      setVersions(loadedVersions);
      setLastBackendSave(new Date(draft.updatedAt));
      lastSavedDataRef.current = JSON.stringify(restoredState);
      setTemplateInitialized(true);
      return;
    }

    // If no draft and templates are loaded, initialize with classic template
    if (leadData?.data && templates.length > 0 && !templateInitialized && !draftResponse) {
      const lead = leadData.data;
      const today = new Date().toISOString().slice(0, 10);
      const reference = `PRO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
      console.log(lead, 'Lead data');
      // Generate client name from lead data
      const clientName = lead.partner2Name
        ? `${lead.partner1Name} & ${lead.partner2Name}`
        : lead.partner1Name;

      // Use wedding date from lead if available
      const proposalDate = lead.weddingDate
        ? new Date(lead.weddingDate).toISOString().slice(0, 10)
        : today;

      // Find the classic template
      const classicTemplate = templates.find((t) => t.templateId === 'classic');
      if (classicTemplate) {
        const initialState: ProposalState = {
          templateId: classicTemplate.templateId,
          templateName: classicTemplate.name,
          companyName: 'Indian Weddings', // Default company name
          logoUrl: '',
          title: `${classicTemplate.name} Proposal`,
          dateISO: proposalDate,
          reference,
          client: {
            name: clientName,
            email: lead.email,
            phone: lead.phoneNumber,
            address: '',
          },
          introHTML: classicTemplate.introHTML || '',
          services: lead.weddingPlan?.services?.length
            ? lead.weddingPlan.services.map((srv: any) => ({
                id: srv.id,
                name: srv.vendorService?.title || 'Unnamed Service',
                description: srv.vendorService?.description || srv.notes || '',
                price: srv.vendorService?.price || 0,
                category: srv.vendorService?.category || 'Other',
                vendorId: srv.vendorService?.vendor?.id,
                vendor: srv.vendorService?.vendor,
              }))
            : [],

          taxesPercent: 18,
          discount: 0,
          paymentTerms: '50% to book, 50% before event',
          termsText: classicTemplate.termsText || '',
          budget: [
            lead?.budgetMin ?? lead.weddingPlan?.totalBudget ?? 0,
            lead?.budgetMax ?? lead.weddingPlan?.totalBudget ?? 0,
          ],
          stage: lead.stage || lead.status,
          events:
            lead?.weddingPlan?.events?.map((e: any) => ({
              id: e.id,
              name: e.name,
              date: e.date ? e.date.split('T')[0] : '',
              startTime: e.startTime || '',
              endTime: e.endTime || '',
              location: e.location || lead.weddingPlan?.destination?.name || '',
            })) || [],
          weddingPlanId: lead.weddingPlanId,
        };
        setData({ state: initialState, versions: [], lastSavedAt: undefined });
        console.log('✅ Services added to proposal state:', initialState.services);

        setTemplateInitialized(true);
      }
    }
  }, [leadData, draftResponse, templates, templateInitialized]);

  function persist(next: Stored) {
    setData(next);
  }

  // Autosave to backend
  const saveToBackend = useCallback(
    async (stateToSave: ProposalState) => {
      if (!leadId || leadId === 'unknown') return;

      const proposalData = {
        reference: stateToSave.reference,
        title: stateToSave.title,
        template: stateToSave.templateId,
        companyName: stateToSave.companyName,
        logoUrl: stateToSave.logoUrl,
        dateISO: stateToSave.dateISO,
        clientName: stateToSave.client.name,
        clientEmail: stateToSave.client.email || undefined,
        clientPhone: stateToSave.client.phone || undefined,
        clientAddress: stateToSave.client.address || undefined,
        introHTML: stateToSave.introHTML,
        termsText: stateToSave.termsText,
        paymentTerms: stateToSave.paymentTerms,
        taxesPercent: stateToSave.taxesPercent,
        discount: stateToSave.discount,
        services: stateToSave.services.map((service) => ({
          name: service.name,
          description: service.description,
          price: service.price,
          quantity: 1,
          category: service.category,
          vendorId: service.vendorId || service.vendor?.id || null,
        })),
      };

      const result = await saveProposalMutation.mutateAsync({ leadId, data: proposalData });
      if (result?.data) {
        proposalIdRef.current = result.data.id;
        setLastBackendSave(new Date());
      }
    },
    [leadId, saveProposalMutation]
  );

  // Manual save function
  const forceSave = async () => {
    await saveToBackend(data.state);
  };

  // Auto-save when data changes
  useEffect(() => {
    // Skip initial mount
    if (!data.state.client?.name) return;

    const currentData = JSON.stringify(data.state);

    // Skip if data hasn't changed
    if (currentData === lastSavedDataRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (3 seconds after last change)
    saveTimeoutRef.current = setTimeout(async () => {
      const latestData = JSON.stringify(data.state);
      if (latestData !== lastSavedDataRef.current) {
        try {
          await saveToBackend(data.state);
          lastSavedDataRef.current = latestData;

          // Save version for auto-save (non-manual)
          await saveVersionToBackend(data.state, false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 3000);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data.state, saveVersionToBackend, saveToBackend]);

  function patchState(patch: Partial<ProposalState>) {
    const next = { ...data, state: { ...data.state, ...patch } };
    persist(next);
  }

  async function saveDraft(silent = false) {
    // Clear any pending auto-save
    console.log('🛰 Sending services to backend:', data.state.services); // <— add this here

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save to backend immediately
    await forceSave();
    lastSavedDataRef.current = JSON.stringify(data.state);

    // Save version for manual save
    await saveVersionToBackend(data.state, true);

    // Update local state (just the timestamp)
    const next: Stored = {
      ...data,
      lastSavedAt: Date.now(),
    };
    setData(next);

    if (!silent) {
      toast.success('Draft saved successfully');
    }
  }

  // Add beforeunload handler to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show browser confirmation if there are unsaved changes
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // function restore(versionId: string) {
  //   const v = versions.find((x) => x.id === versionId);
  //   if (!v || !v.snapshot) {
  //     console.error('Version not found or no snapshot available');
  //     return;
  //   }

  //   // Extract only the ProposalState properties from snapshot
  //   const restoredState: ProposalState = {
  //     templateId: v.snapshot.templateId || data.state.templateId,
  //     templateName: v.snapshot.templateName || data.state.templateName,
  //     companyName: v.snapshot.companyName || data.state.companyName,
  //     logoUrl: v.snapshot.logoUrl,
  //     title: v.snapshot.title || data.state.title,
  //     dateISO: v.snapshot.dateISO || data.state.dateISO,
  //     reference: v.snapshot.reference || data.state.reference,
  //     client: v.snapshot.client || data.state.client,
  //     introHTML: v.snapshot.introHTML || data.state.introHTML,
  //     services: v.snapshot.services || [],
  //     taxesPercent: v.snapshot.taxesPercent || data.state.taxesPercent,
  //     discount: v.snapshot.discount || 0,
  //     paymentTerms: v.snapshot.paymentTerms || data.state.paymentTerms,
  //     termsText: v.snapshot.termsText || data.state.termsText,
  //   };

  //   const next: Stored = {
  //     ...data,
  //     state: restoredState,
  //     lastSavedAt: Date.now(),
  //   };
  //   persist(next);

  //   // Update last saved data ref to prevent immediate auto-save
  //   lastSavedDataRef.current = JSON.stringify(restoredState);

  //   // Save the restored version as a new version
  //   setTimeout(() => {
  //     saveVersionToBackend(restoredState, true);
  //   }, 100);
  // }

  async function handleCreateProposal() {
    // Frontend validation
    const validationErrors: string[] = [];

    if (!data.state.title.trim()) validationErrors.push('Title is required');
    if (!data.state.companyName.trim()) validationErrors.push('Company name is required');
    if (!data.state.client.name.trim()) validationErrors.push('Client name is required');
    if (!data.state.dateISO) validationErrors.push('Date is required');
    if (!data.state.reference.trim()) validationErrors.push('Reference is required');
    if (!data.state.introHTML.trim()) validationErrors.push('Introduction is required');
    if (!data.state.termsText.trim()) validationErrors.push('Terms text is required');
    if (!data.state.paymentTerms.trim()) validationErrors.push('Payment terms are required');
    if (
      data.state.client.email &&
      data.state.client.email.trim() &&
      !data.state.client.email.includes('@')
    ) {
      validationErrors.push('Invalid email format');
    }
    if (data.state.taxesPercent < 0 || data.state.taxesPercent > 100) {
      validationErrors.push('Tax percentage must be between 0 and 100');
    }
    if (data.state.discount < 0) {
      validationErrors.push('Discount cannot be negative');
    }

    if (validationErrors.length > 0) {
      toast.error(`Validation errors: ${validationErrors.join(', ')}`);
      return;
    }

    // Clear any pending auto-save and save immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await forceSave();
    lastSavedDataRef.current = JSON.stringify(data.state);

    // Then finalize it if we have a proposal ID
    if (proposalIdRef.current) {
      await finalizeProposalMutation.mutateAsync(proposalIdRef.current);
      router.push(`/admin/leads/${leadId}`);
    } else {
      toast.error('Please save the draft first');
    }
  }

  function changeTemplate(template: ProposalTemplate) {
    patchState({
      templateId: template.templateId,
      templateName: template.name,
      title: `${template.name} Proposal`,
      introHTML: template.introHTML,
      termsText: template.termsText,
      services: data.state.services,
    });
  }

  function insertIntroVariable() {
    patchState({ introHTML: data.state.introHTML });
  }

  const [historyOpen, setHistoryOpen] = useState(false);

  // Show loading state while fetching lead data, draft, or templates
  if (isLoadingLead || isLoadingDraft || isLoadingTemplates) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isLoadingDraft
                ? 'Loading draft...'
                : isLoadingTemplates
                  ? 'Loading templates...'
                  : 'Loading lead data...'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Show error if lead not found
  if (!leadData?.data && !isLoadingLead) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-4">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Lead not found</p>
          <button
            onClick={() => router.push('/admin/leads')}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black"
          >
            Back to Leads
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-balance text-white">Create Proposal</h1>
          <p className="text-sm text-white">Lead ID: {leadId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-white hover:bg-gray-50"
          >
            Version History
          </button>
          <button
            type="button"
            onClick={() => saveDraft(false)}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-white hover:bg-gray-50"
          >
            Save Draft
          </button>
          {proposalIdRef.current && (
            <button
              type="button"
              onClick={() => router.push(`/admin/proposals/${proposalIdRef.current}/preview`)}
              className="rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            >
              Preview
            </button>
          )}
          <button
            type="button"
            onClick={() => handleCreateProposal()}
            disabled={finalizeProposalMutation.isPending}
            className="rounded bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send to Client
          </button>
        </div>
      </header>

      <div className="mt-2 flex items-center gap-4 text-xs text-white">
        <span>
          {lastBackendSave
            ? `Last saved to server: ${lastBackendSave.toLocaleString()}`
            : 'Not yet saved to server'}
        </span>
        {saveProposalMutation.isPending && (
          <span className="flex items-center gap-1">
            <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></span>
            Saving...
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6">
        <TemplateGallery value={data.state.templateId} onChange={changeTemplate} />

        <HeaderSection
          companyName={data.state.companyName}
          logoUrl={data.state.logoUrl}
          title={data.state.title}
          dateISO={data.state.dateISO}
          reference={data.state.reference}
          client={data.state.client}
          onChange={(patch) => {
            patchState({
              companyName: patch.companyName ?? data.state.companyName,
              logoUrl: patch.logoUrl ?? data.state.logoUrl,
              title: patch.title ?? data.state.title,
              dateISO: patch.dateISO ?? data.state.dateISO,
              reference: patch.reference ?? data.state.reference,
              client: patch.client ?? data.state.client,
            });
          }}
        />

        <IntroSection
          valueHTML={data.state.introHTML}
          onChange={(html) => patchState({ introHTML: html })}
          onInsertVar={insertIntroVariable}
        />

        <ServicesSection
          services={data.state.services}
          onChange={(services) => patchState({ services })}
        />
        <EventsSection
          events={data.state.events || []}
          onChange={(updatedEvents) => {
            const safeEvents = updatedEvents.map((e) => ({ ...e }));
            patchState({ events: safeEvents });
          }}
        />

        <BudgetSection
          budget={data.state.budget ?? [500000, 2000000]}
          onChange={(value) => patchState({ budget: value })}
        />

        {acceptedVendorsByCategory && Object.keys(acceptedVendorsByCategory).length > 0 && (
          <section className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-white">
            <h2 className="text-lg font-semibold mb-3">Accepted Vendors by Service</h2>

            <div className="space-y-5">
              {Object.values(acceptedVendorsByCategory).map((entry: any) => (
                <div
                  key={entry.category}
                  className="rounded-md border border-gray-600 bg-gray-900 p-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-teal-400">{entry.category}</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      // onClick={() =>
                      //   router.push(`/admin/leads/${leadId}/vendor-assignment?service=${entry.category}`)
                      // }

                      onClick={() => {
                        console.log('services available:', data.state.services);
                        console.log('current entry category:', entry.category);

                        const proposalId = proposalIdRef.current;
                        console.log(
                          'services available:',
                          data.state.services.map((s) => ({
                            id: s.id,
                            name: s.name,
                            category: s.category,
                          }))
                        );
                        console.log('entry.category:', entry.category);
                        const service = data.state.services.find(
                          (s) =>
                            (s.category || s.name || '').toLowerCase() ===
                            (entry.category || '').toLowerCase()
                        );

                        if (!proposalId || !service) {
                          console.error(
                            'Missing proposalId or matching service for category:',
                            entry.category
                          );
                          return;
                        }

                        router.push(
                          `/admin/leads/${leadId}/vendor-assignment?proposalId=${proposalId}&serviceId=${service.id}&service=${encodeURIComponent(entry.category)}`
                        );
                      }}
                    >
                      Assign Vendors
                    </Button>
                  </div>

                  {entry.vendors.length > 0 ? (
                    <ul className="ml-4 list-disc text-sm text-gray-300 mt-2">
                      {entry.vendors.map((v: any) => (
                        <li key={v.id}>
                          {v.name} ({v.email || 'No Email'})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm mt-2">No vendor assigned yet.</p>
                  )}
                </div>
              ))}

              {draftResponse?.data?.services?.some((s: any) => s.vendorId) && (
                <section className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-white mt-6">
                  <h2 className="text-lg font-semibold mb-3">Vendors Assigned by Admin</h2>

                  <div className="space-y-5">
                    {draftResponse.data.services
                      .filter((s: any) => s.vendorId)
                      .map((service: any) => (
                        <div
                          key={service.id}
                          className="rounded-md border border-gray-600 bg-gray-900 p-3"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-teal-400">
                              {service.category || service.name}
                            </h3>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/admin/leads/${leadId}/vendor-assignment?proposalId=${draftResponse.data.id}&serviceId=${service.id}&service=${encodeURIComponent(service.category || service.name)}`
                                )
                              }
                            >
                              Reassign Vendor
                            </Button>
                          </div>

                          <div className="mt-2 text-sm text-gray-300">
                            <p>
                              <span className="font-medium">Name:</span>{' '}
                              {service.vendor?.name || 'N/A'}
                            </p>
                            <p>
                              <span className="font-medium">Email:</span>{' '}
                              {service.vendor?.email || 'N/A'}
                            </p>
                            <p>
                              <span className="font-medium">Contact:</span>{' '}
                              {service.vendor?.contactNo || 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}
            </div>
          </section>
        )}

        <PricingTable
          services={data.state.services}
          taxesPercent={data.state.taxesPercent}
          discount={data.state.discount}
          paymentTerms={data.state.paymentTerms}
          onChange={(patch) => patchState(patch as Partial<ProposalState>)}
        />

        <TermsSection value={data.state.termsText} onChange={(v) => patchState({ termsText: v })} />
      </div>

      <footer className="mt-8 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => saveDraft(false)}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-white hover:bg-gray-50 hover:text-black"
        >
          Save Draft
        </button>
        {proposalIdRef.current && (
          <button
            type="button"
            onClick={() => router.push(`/admin/proposals/${proposalIdRef.current}/preview`)}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Preview
          </button>
        )}
        <button
          type="button"
          onClick={() => handleCreateProposal()}
          disabled={finalizeProposalMutation.isPending}
          className="rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send to Client
        </button>
      </footer>

      <VersionHistoryModal
        open={historyOpen}
        versions={versions}
        onClose={() => setHistoryOpen(false)}
        // onRestore={(id) => {
        //   restore(id);
        //   setHistoryOpen(false);
        // }}
      />
      {showVendorAssignModal && (
        <VendorAssignmentView
          selectedService={selectedService}
          availableVendors={availableVendors}
          isVendorsLoading={isVendorsLoading}
          handleAssignVendor={handleAssignVendor}
        />
      )}
    </main>
  );
}
