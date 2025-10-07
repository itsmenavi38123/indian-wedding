import { UserProvider } from './(auth)/context/userContext';
import ClientVendorLoader from './components/ClientVendorLoader';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ClientVendorLoader />
      {children}
    </UserProvider>
  );
}
