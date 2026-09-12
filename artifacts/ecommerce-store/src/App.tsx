import { type ReactNode, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { StoreShell } from '@/components/store-shell';
import { Home } from '@/pages/home';
import { Shop } from '@/pages/shop';
import { ProductDetail } from '@/pages/product-detail';
import { Cart } from '@/pages/cart';
import { Account } from '@/pages/account';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#183A32',
    colorForeground: '#183A32',
    colorMutedForeground: '#667770',
    colorDanger: '#B94A42',
    colorBackground: '#F6F1E7',
    colorInput: '#FBF8F2',
    colorInputForeground: '#183A32',
    colorNeutral: '#D5CDBF',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '2px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#F6F1E7] rounded-none w-[440px] max-w-full overflow-hidden border border-[#D5CDBF]',
    card: '!shadow-none !border-0 !bg-transparent',
    footer: '!shadow-none !border-0 !bg-transparent',
    headerTitle: 'font-serif text-[#183A32] text-4xl',
    headerSubtitle: 'text-[#667770]',
    socialButtonsBlockButtonText: 'text-[#183A32]',
    formFieldLabel: 'text-[#183A32]',
    footerActionLink: 'text-[#183A32] underline',
    footerActionText: 'text-[#667770]',
    dividerText: 'text-[#667770]',
    formButtonPrimary: 'bg-[#183A32] hover:bg-[#D98F4D] text-[#F6F1E7] rounded-none',
    formFieldInput: 'bg-[#FBF8F2] border-[#D5CDBF] text-[#183A32] rounded-none',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#D5CDBF]',
    alert: 'bg-[#F4DDD4] text-[#183A32]',
    alertText: 'text-[#183A32]',
    main: 'bg-transparent',
  },
};

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={() => <StoreShell><Home /></StoreShell>} />
        <Route path="/shop" component={() => <StoreShell><Shop /></StoreShell>} />
        <Route path="/products/:productId" component={() => <StoreShell><ProductDetail /></StoreShell>} />
        <Route path="/cart" component={() => <StoreShell><Cart /></StoreShell>} />
        <Route path="/account" component={() => <StoreShell><Account /></StoreShell>} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function SignInPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>;
}

function SignUpPage() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUserId = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const nextUserId = user?.id ?? null;
      if (previousUserId.current !== undefined && previousUserId.current !== nextUserId) queryClient.clear();
      previousUserId.current = nextUserId;
    });
    return unsubscribe;
  }, [addListener]);
  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Your considered edit is waiting.' } },
        signUp: { start: { title: 'Make room for good things', subtitle: 'Create your Northstar account.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      <Router />
    </ClerkProvider>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
