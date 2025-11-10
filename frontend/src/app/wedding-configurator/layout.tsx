'use client';

import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { SUBDOMAIN_CONFIG } from '@/lib/constant';

export default function ConfiguratorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const configuratorState = useAppSelector((state) => state.configurator);

  const steps = [
    { number: 1, name: 'Welcome', path: '/wedding-configurator/welcome' },
    { number: 2, name: 'Vibe', path: '/wedding-configurator/vibe' },
    { number: 3, name: 'Location', path: '/wedding-configurator/location' },
    { number: 4, name: 'Budget', path: '/wedding-configurator/budget' },
    { number: 5, name: 'Review', path: '/wedding-configurator/review' },
    { number: 6, name: 'Vendors', path: '/wedding-configurator/vendors' },
    { number: 7, name: 'Publish', path: '/wedding-configurator/publish' },
  ];

  const currentStepIndex = steps.findIndex((step) => pathname === step.path);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-20">
      {/* Progress Bar - Not Sticky */}
      <div className="bg-white shadow-sm mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${index + 1 <= currentStep ? 'bg-gold text-white' : 'bg-gray-200 text-gray-600'}
                  `}
                >
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      w-12 h-1 mx-2
                      ${index + 1 < currentStep ? 'bg-gold' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            {steps.map((step) => (
              <span key={step.number} className="w-8 text-center">
                {step.name}
              </span>
            ))}
          </div>
        </div>

        {/* Progress percentage */}
        <div className="w-full bg-gray-200 h-1">
          <div
            className="bg-gold h-1 transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="py-8 pb-24">{children}</div>

      {/* Footer Info - Keep Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-3">
              {configuratorState.coupleNames && (
                <span className="font-medium text-gold">{configuratorState.coupleNames}</span>
              )}
              {configuratorState.vibe && (
                <span className="text-gray-500">• {configuratorState.vibe}</span>
              )}
              {configuratorState.region && (
                <span className="text-gray-500">• {configuratorState.region}</span>
              )}
              {configuratorState.subdomain && (
                <a
                  href={`${SUBDOMAIN_CONFIG.protocol}://${configuratorState.subdomain}.${SUBDOMAIN_CONFIG.baseDomain}:${SUBDOMAIN_CONFIG.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 px-3 py-1 bg-gold/10 text-gold rounded-full hover:bg-gold/20 transition-colors text-xs font-medium"
                >
                  🔗 View Site
                </a>
              )}
            </div>
            <div className="text-gray-400">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
