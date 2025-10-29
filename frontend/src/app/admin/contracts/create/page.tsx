'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, MapPin, IndianRupee, Signature } from 'lucide-react';

export default function CreateContractTemplatePage() {
  const [template, setTemplate] = useState({
    contractTitle: 'Wedding Planning Contract',
    partner1Name: '',
    partner2Name: '',
    weddingLocation: '',
    budget: '',
    events: '',
    services: '',
    advancePayment: '',
    termsAndConditions: '',
    signatureClient: '',
    signatureCompany: '',
    startDate: '',
    endDate: '',
  });

  const patch = (key: string, value: string) => setTemplate((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Contract Template</h1>
          <p className="text-sm text-muted-foreground">
            Define contract details, partners, and terms.
          </p>
        </div>
      </div>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" /> Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Contract Title</label>
              <Input
                value={template.contractTitle}
                onChange={(e) => patch('contractTitle', e.target.value)}
                placeholder="Enter title"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Budget (₹)</label>
              <Input
                value={template.budget}
                onChange={(e) => patch('budget', e.target.value)}
                type="number"
                placeholder="e.g. 500000"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Start Date
              </label>
              <Input
                type="date"
                value={template.startDate}
                onChange={(e) => patch('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" /> End Date
              </label>
              <Input
                type="date"
                value={template.endDate}
                onChange={(e) => patch('endDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partners */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Partner 1 Name</label>
            <Input
              value={template.partner1Name}
              onChange={(e) => patch('partner1Name', e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Partner 2 Name</label>
            <Input
              value={template.partner2Name}
              onChange={(e) => patch('partner2Name', e.target.value)}
              placeholder="Enter name"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Wedding Location
            </label>
            <Input
              value={template.weddingLocation}
              onChange={(e) => patch('weddingLocation', e.target.value)}
              placeholder="City / Venue"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events & Services */}
      <Card>
        <CardHeader>
          <CardTitle>Events & Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Events</label>
            <Textarea
              rows={3}
              value={template.events}
              onChange={(e) => patch('events', e.target.value)}
              placeholder="List all planned events..."
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Services Included</label>
            <Textarea
              rows={3}
              value={template.services}
              onChange={(e) => patch('services', e.target.value)}
              placeholder="Catering, Décor, Photography, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-gold-500" /> Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Advance Payment</label>
            <Input
              value={template.advancePayment}
              onChange={(e) => patch('advancePayment', e.target.value)}
              placeholder="e.g. 50% of total amount"
            />
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={5}
            value={template.termsAndConditions}
            onChange={(e) => patch('termsAndConditions', e.target.value)}
            placeholder="Write your terms and conditions..."
          />
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signature className="h-5 w-5 text-gold-500" /> Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6 mt-2">
            <div>
              <label className="text-sm text-muted-foreground">Client Signature</label>
              <Input
                value={template.signatureClient}
                onChange={(e) => patch('signatureClient', e.target.value)}
                placeholder="Type name or upload signature later"
              />
              <Separator className="my-2" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Company Representative</label>
              <Input
                value={template.signatureCompany}
                onChange={(e) => patch('signatureCompany', e.target.value)}
                placeholder="Company authorized name"
              />
              <Separator className="my-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
