// 'use client';
// import Link from 'next/link';
// import React from 'react';

// const VendorsPage = () => {
//   return (
//     <div className="pt-24 min-h-screen flex flex-col items-center justify-center bg-[#fef8f0] text-black px-4">
//       <h1 className="text-6xl md:text-8xl font-extrabold mb-6 animate-pulse text-gold">
//         Coming Soon
//       </h1>
//       <p className="text-lg md:text-2xl mb-8 text-center max-w-xl">
//         Discover trusted Indian wedding vendors. From photographers and decorators to caterers and
//         makeup artists, find the best partners for your celebration.
//       </p>
//       <div className="flex gap-4">
//         <Link
//           href="mailto:info@yourcompany.com"
//           className="px-6 py-3 bg-gold text-white font-semibold rounded-lg shadow-lg hover:bg-yellow-600 transition"
//         >
//           Contact Us
//         </Link>
//         <Link
//           href="/"
//           className="px-6 py-3 border-2 border-gold text-gold font-semibold rounded-lg hover:bg-gold hover:text-white transition"
//         >
//           Go Home
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default VendorsPage;


'use client';
import React from 'react';
import Image from 'next/image';
import { useInfiniteVendorHomePage, VendorHomePageParams } from '@/services/api/vendors';

const VendorsPage = () => {
  const filters: VendorHomePageParams = { page: 1, limit: 5 };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteVendorHomePage(filters);

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading vendors...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center text-lg font-semibold text-red-600">
        Failed to load vendors.
      </div>
    );
  }

  const vendors = data?.pages.flatMap((page: any) => page.data) || [];

  return (
    <div className="pt-24 min-h-screen bg-[#fef8f0] px-4">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-center text-gold">
        Wedding Vendors
      </h1>

      {vendors.length === 0 ? (
        <div className="text-center text-lg text-gray-600 mt-16">
          No vendors found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor: any) => (
            <div
              key={vendor.id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col"
            >
              <h2 className="font-bold text-xl mb-1">{vendor.name}</h2>
              <p className="text-sm text-gray-600 mb-2">{vendor.serviceTypes}</p>
              <p className="text-sm text-gray-600 mb-2">
                Contact: {vendor.countryCode} {vendor.contactNo}
              </p>

              {vendor.vendorServices.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {vendor.vendorServices.map((service: any) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-md p-2 flex items-start gap-2"
                    >
                      {service.thumbnail?.url ? (
                        <Image
                          src={service.thumbnail.url}
                          alt={service.title}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                          No Image
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{service.title}</p>
                        <p className="text-sm text-gray-600">{service.category}</p>
                        <p className="text-sm text-gray-800">
                          Price: ${service.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No services available.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More button */}
      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 bg-gold text-white font-semibold rounded-lg shadow hover:bg-yellow-600 transition"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;

