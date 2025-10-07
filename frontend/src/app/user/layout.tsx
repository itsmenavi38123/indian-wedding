import ClientUserLoader from './(auth)/components/ClientUserLoader';
import { UserProvider } from './(auth)/context/userContext';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ClientUserLoader />
      {children}
    </UserProvider>
  );
}
