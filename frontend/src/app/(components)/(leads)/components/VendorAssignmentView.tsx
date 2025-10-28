'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/services/axiosInstance';
import Image from 'next/image';

export default function VendorAssignmentView({
  selectedService,
  availableVendors,
  isVendorsLoading,
  handleAssignVendor,
  onClose,
  leadId,
}: any) {
  const [filters, setFilters] = useState({
    serviceType: '',
    minBudget: '',
    maxBudget: '',
    location: '',
    startDate: '',
    endDate: '',
  });

  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const allVendors =
    filteredVendors.length > 0
      ? filteredVendors
      : availableVendors?.allVendors || availableVendors || [];

  const isFiltered = Object.values(filters).some((v) => v !== '');
  const noResultsAfterFilter = isFiltered && filteredVendors.length === 0;
  const noVendorsAvailable = !isFiltered && (allVendors.length === 0 || !availableVendors);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.entries(filters).filter(([v]) => v !== '')
      ).toString();

      const { data } = await axiosInstance.get(`lead/get-all-vendors-for-lead/${leadId}?${params}`);

      setFilteredVendors(data?.data?.allVendors || []);
    } catch (error) {
      console.error('Error applying vendor filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      serviceType: '',
      minBudget: '',
      maxBudget: '',
      location: '',
      startDate: '',
      endDate: '',
    });
    setFilteredVendors([]);
  };

  if (isVendorsLoading || loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-sm">
        Loading vendors...
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      {/* 🧭 Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h3 className="text-2xl font-bold">
            Assign Vendor for <span className="text-primary">{selectedService}</span>
          </h3>
          <p className="text-gray-500 text-sm">
            Review vendor details, services, and media before assigning.
          </p>
        </div>

        {onClose && (
          <Button variant="outline" onClick={onClose}>
            ← Back to Proposal
          </Button>
        )}
      </div>

      {/* 🎛️ Filter Section */}
      <div className="mb-10 p-6 bg-white border rounded-2xl shadow-sm space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Filter Vendors</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <Label>Service Type</Label>
            <Input
              name="serviceType"
              placeholder="e.g. Photography, Decor"
              value={filters.serviceType}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              name="location"
              placeholder="City, State or Country"
              value={filters.location}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
              <Label>Min Budget</Label>
              <Input
                name="minBudget"
                type="number"
                placeholder="₹ min"
                value={filters.minBudget}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2">
              <Label>Max Budget</Label>
              <Input
                name="maxBudget"
                type="number"
                placeholder="₹ max"
                value={filters.maxBudget}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-2 col-span-1 md:col-span-3">
            <div className="w-1/2">
              <Label>Start Date</Label>
              <Input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2">
              <Label>End Date</Label>
              <Input type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button onClick={applyFilters} disabled={loading}>
            {loading ? 'Filtering...' : 'Apply Filters'}
          </Button>
          <Button variant="outline" onClick={resetFilters} disabled={loading}>
            Reset
          </Button>
        </div>
      </div>

      {/* 🧾 Vendor Listing */}
      {noResultsAfterFilter ? (
        <p className="text-gray-500 text-sm italic mt-10 text-center">
          No matched vendors found for the selected filters.
        </p>
      ) : noVendorsAvailable ? (
        <p className="text-gray-500 text-sm italic mt-10 text-center">
          No vendors available right now.
        </p>
      ) : (
        <div className="space-y-10">
          {allVendors.map((vendor: any) => {
            const vendorServices = vendor?.services || [];

            return (
              <div
                key={vendor.id}
                className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Vendor Info */}
                <div className="flex justify-between items-start border-b pb-3 mb-4">
                  <div>
                    <h4 className="text-xl font-semibold">{vendor.name}</h4>
                    <p className="text-sm text-gray-600">{vendor.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Contact: {vendor.contactNo || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Services Offered: {vendor.serviceTypes || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₹{vendor.minimumAmount?.toLocaleString()} - ₹
                      {vendor.maximumAmount?.toLocaleString()}
                    </p>
                  </div>

                  <Button size="sm" onClick={() => handleAssignVendor(vendor.id)}>
                    Assign
                  </Button>
                </div>

                {/* Vendor Services */}
                {vendorServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendorServices.map((vService: any, i: number) => (
                      <div key={i} className="border rounded-xl p-5 bg-gray-50 shadow-sm space-y-4">
                        <h5 className="text-lg font-semibold text-gray-900">
                          {vService.name || 'Untitled Service'}
                        </h5>
                        <p className="text-sm text-gray-700">
                          {vService.description || 'No description available.'}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <p>
                            <span className="font-semibold">Category:</span>{' '}
                            {vService.category || 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold">Price:</span> ₹
                            {vService.price?.toLocaleString() || 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold">Destination:</span>{' '}
                            {vService.city
                              ? vService.city
                              : vService.state
                                ? vService.state
                                : vService.country || 'N/A'}
                          </p>
                        </div>

                        {vService.thumbnailUrl && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Thumbnail:</p>

                            <Image
                              src={vService.thumbnailUrl}
                              alt={vService.title || 'Vendor service thumbnail'}
                              className="w-full h-56 object-cover rounded-lg shadow"
                              width={400}
                              height={300}
                            />
                          </div>
                        )}

                        {vService.media?.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-2">Media:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {vService.media.map((m: any, j: number) => (
                                <Image
                                  key={j}
                                  src={m.url}
                                  alt={`Media ${j + 1}`}
                                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition"
                                  width={300}
                                  height={200}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">No services added for this vendor.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
