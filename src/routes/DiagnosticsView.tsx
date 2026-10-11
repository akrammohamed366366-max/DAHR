import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Lock,
  ArrowRightLeft,
  Layers,
  Activity,
  AlertTriangle,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { app, db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { seedInitialFirestoreData } from '../utils/seeder';

interface CheckResult {
  status: 'pending' | 'running' | 'success' | 'failure';
  latencyMs?: number;
  docCount?: number;
  docIds?: string[];
  dataPreview?: any;
  error?: {
    code?: string;
    name?: string;
    message?: string;
    raw?: string;
  };
}

interface RoundTripResult {
  status: 'pending' | 'running' | 'success' | 'failure';
  latencyMs?: number;
  writeSuccess?: boolean;
  readSuccess?: boolean;
  dataMatched?: boolean;
  writtenPayload?: any;
  retrievedPayload?: any;
  error?: {
    code?: string;
    name?: string;
    message?: string;
    raw?: string;
  };
}

export function DiagnosticsView() {
  const { user, isFullAdmin, role, signIn, signOut, loading: authLoading } = useAuth();

  // Login form state for ungated access
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Seeding state
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedReport, setSeedReport] = useState<string | null>(null);

  // Diagnostic check states
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [collectionsCheck, setCollectionsCheck] = useState<{
    products: CheckResult;
    journalArticles: CheckResult;
    orders: CheckResult;
    adminUsers: CheckResult;
  }>({
    products: { status: 'pending' },
    journalArticles: { status: 'pending' },
    orders: { status: 'pending' },
    adminUsers: { status: 'pending' },
  });

  const [roundTripCheck, setRoundTripCheck] = useState<RoundTripResult>({
    status: 'pending',
  });

  // Extract live config from initialized Firebase instance
  const isForceLongPolling = Boolean(
    (db as any)._settings?.experimentalForceLongPolling ??
    (db as any)._delegate?._settings?.experimentalForceLongPolling
  );

  const liveAppOptions = {
    projectId: app.options.projectId || '(Not configured)',
    authDomain: app.options.authDomain || '(Not configured)',
    appId: app.options.appId || '(Not configured)',
    storageBucket: app.options.storageBucket || '(Not configured)',
    appName: app.name,
    isInitialized: Boolean(app),
    databaseId: (db as any)._databaseId?.database || (db as any)._delegate?._databaseId?.database || 'default',
    transportMode: isForceLongPolling
      ? 'Long-Polling (experimentalForceLongPolling: true)'
      : 'Normal WebChannel Streaming (gRPC-Web / HTTP/2 stream with fallback)',
    navigatorOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };

  const runAllDiagnostics = useCallback(async () => {
    setIsRunningAll(true);

    // 1. Audit Collections (products, journalArticles, orders, adminUsers)
    const collectionsToTest = ['products', 'journalArticles', 'orders', 'adminUsers'] as const;

    // Run each check independently so failure in one does not stop the others
    const checkCollection = async (collName: typeof collectionsToTest[number]) => {
      setCollectionsCheck((prev) => ({
        ...prev,
        [collName]: { status: 'running' },
      }));

      const startTime = performance.now();
      try {
        const collRef = collection(db, collName);
        const snapshot = await getDocs(collRef);
        const endTime = performance.now();

        const docIds = snapshot.docs.map((d) => d.id);
        const sampleData = snapshot.docs.slice(0, 3).map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            name: raw.name || raw.title || raw.email || raw.id,
            status: raw.status || raw.role,
          };
        });

        setCollectionsCheck((prev) => ({
          ...prev,
          [collName]: {
            status: 'success',
            latencyMs: Math.round(endTime - startTime),
            docCount: snapshot.size,
            docIds,
            dataPreview: sampleData,
          },
        }));
      } catch (err: any) {
        const endTime = performance.now();
        console.error(`Diagnostics check failed for collection [${collName}]:`, err);
        setCollectionsCheck((prev) => ({
          ...prev,
          [collName]: {
            status: 'failure',
            latencyMs: Math.round(endTime - startTime),
            error: {
              code: err?.code || 'UNKNOWN_ERROR',
              name: err?.name || 'Error',
              message: err?.message || String(err),
              raw: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
            },
          },
        }));
      }
    };

    // 2. Audit Write-Read Round Trip against _diagnostics/connectionTest
    const checkRoundTrip = async () => {
      setRoundTripCheck({ status: 'running' });
      const startTime = performance.now();
      const testDocRef = doc(db, '_diagnostics', 'connectionTest');
      const testNonce = `nonce_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const payload = {
        testNonce,
        clientTimestamp: new Date().toISOString(),
        authUid: auth.currentUser?.uid || 'anonymous',
        authEmail: auth.currentUser?.email || 'unauthenticated',
        buildEnv: 'DAHR Diagnostics Test',
      };

      try {
        // Step A: Real Write
        await setDoc(testDocRef, payload);

        // Step B: Real Read-back
        const docSnap = await getDoc(testDocRef);
        const endTime = performance.now();

        if (!docSnap.exists()) {
          setRoundTripCheck({
            status: 'failure',
            latencyMs: Math.round(endTime - startTime),
            writeSuccess: true,
            readSuccess: false,
            dataMatched: false,
            writtenPayload: payload,
            error: {
              code: 'NOT_FOUND_AFTER_WRITE',
              message: 'Document write returned success, but read-back reported document does not exist.',
            },
          });
          return;
        }

        const retrieved = docSnap.data();
        const matches = retrieved?.testNonce === testNonce;

        setRoundTripCheck({
          status: matches ? 'success' : 'failure',
          latencyMs: Math.round(endTime - startTime),
          writeSuccess: true,
          readSuccess: true,
          dataMatched: matches,
          writtenPayload: payload,
          retrievedPayload: retrieved,
          error: matches
            ? undefined
            : {
                code: 'PAYLOAD_MISMATCH',
                message: `Retrieved nonce (${retrieved?.testNonce}) did not match written nonce (${testNonce}).`,
              },
        });
      } catch (err: any) {
        const endTime = performance.now();
        console.error('Diagnostics round trip write/read failed:', err);
        setRoundTripCheck({
          status: 'failure',
          latencyMs: Math.round(endTime - startTime),
          error: {
            code: err?.code || 'ROUND_TRIP_FAILED',
            name: err?.name || 'Error',
            message: err?.message || String(err),
            raw: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
          },
        });
      }
    };

    await Promise.all([
      checkCollection('products'),
      checkCollection('journalArticles'),
      checkCollection('orders'),
      checkCollection('adminUsers'),
      checkRoundTrip(),
    ]);

    setIsRunningAll(false);
  }, []);

  // Run automatically when user is fullAdmin
  useEffect(() => {
    if (isFullAdmin) {
      runAllDiagnostics();
    }
  }, [isFullAdmin, runAllDiagnostics]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await signIn(emailInput, passwordInput);
    } catch (err: any) {
      setLoginError(err?.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedReport(null);
    try {
      const res = await seedInitialFirestoreData(true);
      setSeedReport(`Successfully seeded ${res.productsCount} products and ${res.articlesCount} articles.`);
      // Re-run diagnostics to reflect updated document counts
      runAllDiagnostics();
    } catch (err: any) {
      setSeedReport(`Seeding error: ${err?.message || String(err)}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // --------------------------------------------------------------------------
  // Render: Loading State
  // --------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-stone-900 text-stone-200">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <p className="text-sm tracking-widest uppercase font-mono text-stone-400">
          Authenticating security privileges...
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: Gated Screen (Not signed in or not FullAdmin)
  // --------------------------------------------------------------------------
  if (!isFullAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-stone-950 text-stone-200">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 p-8 rounded-lg shadow-2xl space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-serif tracking-wide text-stone-100">
                Diagnostics Gate
              </h1>
              <p className="text-xs text-stone-400 font-mono">
                Access Restricted to Full Administrators
              </p>
            </div>
          </div>

          <div className="p-3 bg-stone-800/60 border border-stone-700/60 rounded text-xs text-stone-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-400">Current Auth Status:</span>
              <span className="font-mono text-amber-400">
                {user ? `Signed In (${user.email})` : 'Unauthenticated'}
              </span>
            </div>
            {user && (
              <div className="flex justify-between">
                <span className="text-stone-400">Assigned Role:</span>
                <span className="font-mono text-stone-300">
                  {role ? role : 'No administrative role (Customer)'}
                </span>
              </div>
            )}
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded text-xs text-red-300">
                Your current account does not have the <code className="text-red-200">fullAdmin</code> role in the <code className="text-red-200">adminUsers</code> collection. Please sign in with an authorized fullAdmin account to inspect live backend diagnostics.
              </div>
              <button
                onClick={() => signOut()}
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono tracking-wider uppercase rounded flex items-center justify-center space-x-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Current Account</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded text-xs text-red-300">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@dahr.luxury"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-sm text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-medium text-xs font-mono tracking-wider uppercase rounded flex items-center justify-center space-x-2 transition-colors"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Sign In as Administrator</span>
              </button>
            </form>
          )}

          <div className="border-t border-stone-800 pt-4">
            <p className="text-[11px] text-stone-500 text-center font-mono">
              DAHR Perfumery • Backend Diagnostic Console
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: Full Admin Diagnostics Dashboard
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Danger/Warning Notice */}
        <div className="bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-amber-200">
                TEMPORARY DIAGNOSTIC CONSOLE (FullAdmin Authorized)
              </h2>
              <p className="text-xs text-amber-300/80 mt-0.5">
                This internal console executes real read and write queries against the live Cloud Firestore database. It exposes direct project identifiers and error telemetry. Remember to remove or re-gate this route before customer release.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => runAllDiagnostics()}
              disabled={isRunningAll}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono uppercase tracking-wider rounded flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
              <span>{isRunningAll ? 'Testing...' : 'Re-run Checks'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Initialized Firebase App Metadata */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <Server className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-medium text-stone-100">
                1. Initialized Firebase Instance Metadata
              </h2>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-emerald-950 border border-emerald-800 text-emerald-300">
              Instance Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-stone-950 rounded border border-stone-800/80 space-y-1">
              <div className="text-stone-500 text-[11px] uppercase">projectId (Live App)</div>
              <div className="text-amber-300 break-all select-all font-semibold">
                {liveAppOptions.projectId}
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded border border-stone-800/80 space-y-1">
              <div className="text-stone-500 text-[11px] uppercase">authDomain (Live App)</div>
              <div className="text-stone-200 break-all select-all">
                {liveAppOptions.authDomain}
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded border border-stone-800/80 space-y-1">
              <div className="text-stone-500 text-[11px] uppercase">firestoreDatabaseId</div>
              <div className="text-stone-200 break-all select-all">
                {liveAppOptions.databaseId}
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded border border-stone-800/80 space-y-1">
              <div className="text-stone-500 text-[11px] uppercase">appId</div>
              <div className="text-stone-400 break-all select-all">
                {liveAppOptions.appId}
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded border border-stone-800/80 space-y-1">
              <div className="text-stone-500 text-[11px] uppercase">storageBucket</div>
              <div className="text-stone-400 break-all select-all">
                {liveAppOptions.storageBucket}
              </div>
            </div>

            <div className="p-3 bg-stone-950 rounded border border-stone-800/80 space-y-1">
              <div className="text-stone-500 text-[11px] uppercase">Transport Layer</div>
              <div className="text-emerald-400 break-all">
                {liveAppOptions.transportMode}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Real Collection Read Audits */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <Database className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-medium text-stone-100">
                2. Live Collection Read Audits
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding || isRunningAll}
                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono rounded flex items-center space-x-1 border border-stone-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSeeding ? 'Seeding...' : 'Seed Catalog to Firestore'}</span>
              </button>
            </div>
          </div>

          {seedReport && (
            <div className="p-3 bg-stone-800 border border-amber-500/40 rounded text-xs font-mono text-amber-300">
              {seedReport}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                { id: 'products', label: 'products', desc: 'Active & draft fragrance extraits' },
                { id: 'journalArticles', label: 'journalArticles', desc: 'Bilingual harvest & formulation essays' },
                { id: 'orders', label: 'orders', desc: 'Customer checkout orders (Admin only)' },
                { id: 'adminUsers', label: 'adminUsers', desc: 'Staff & fullAdmin role directory' },
              ] as const
            ).map((coll) => {
              const res = collectionsCheck[coll.id];
              return (
                <div
                  key={coll.id}
                  className={`p-4 rounded-lg border font-mono text-xs space-y-3 ${
                    res.status === 'success'
                      ? 'bg-stone-950/80 border-emerald-900/60'
                      : res.status === 'failure'
                      ? 'bg-red-950/30 border-red-800/80'
                      : 'bg-stone-950/40 border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-stone-200">{coll.label}</span>
                      <p className="text-[11px] text-stone-500 font-sans">{coll.desc}</p>
                    </div>
                    {res.status === 'running' && (
                      <span className="flex items-center text-amber-400 space-x-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Querying...</span>
                      </span>
                    )}
                    {res.status === 'success' && (
                      <span className="flex items-center text-emerald-400 space-x-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PASS ({res.docCount} docs)</span>
                      </span>
                    )}
                    {res.status === 'failure' && (
                      <span className="flex items-center text-red-400 space-x-1 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>FAILED</span>
                      </span>
                    )}
                  </div>

                  {res.status === 'success' && (
                    <div className="space-y-1.5 pt-2 border-t border-stone-900 text-stone-400">
                      <div className="flex justify-between text-[11px]">
                        <span>Query Latency:</span>
                        <span className="text-emerald-400 font-semibold">{res.latencyMs} ms</span>
                      </div>
                      <div className="text-[11px]">
                        <span className="text-stone-500">Document IDs ({res.docCount}):</span>
                        <div className="mt-1 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                          {res.docIds && res.docIds.length > 0 ? (
                            res.docIds.map((id) => (
                              <span
                                key={id}
                                className="px-1.5 py-0.5 bg-stone-900 rounded border border-stone-800 text-[10px] text-stone-300"
                              >
                                {id}
                              </span>
                            ))
                          ) : (
                            <span className="text-stone-500 italic">0 documents found (Collection is empty)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {res.status === 'failure' && res.error && (
                    <div className="space-y-2 pt-2 border-t border-red-900/60 text-red-300">
                      <div>
                        <span className="text-red-400 font-bold uppercase text-[10px]">Error Code:</span>{' '}
                        <code className="text-red-200 bg-red-950 px-1 py-0.5 rounded">{res.error.code}</code>
                      </div>
                      <div>
                        <span className="text-red-400 font-bold uppercase text-[10px]">Message:</span>
                        <p className="mt-0.5 text-[11px] text-red-200 bg-red-950/60 p-2 rounded border border-red-900/60 break-all font-mono">
                          {res.error.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Write-Read-Delete Round Trip */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-medium text-stone-100">
                3. Real Write-Read-Verify Round Trip Audit
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-400">
              Path: <code className="text-amber-300">_diagnostics/connectionTest</code>
            </span>
          </div>

          <div
            className={`p-5 rounded-lg border font-mono text-xs space-y-4 ${
              roundTripCheck.status === 'success'
                ? 'bg-stone-950 border-emerald-900/60'
                : roundTripCheck.status === 'failure'
                ? 'bg-red-950/30 border-red-800/80'
                : 'bg-stone-950/50 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-stone-200">
                  Document Write &amp; Immediate Read-Back Test
                </span>
                <p className="text-[11px] text-stone-500 font-sans">
                  Writes a cryptographically unique nonce to Firestore and confirms matching retrieved payload.
                </p>
              </div>

              {roundTripCheck.status === 'running' && (
                <span className="flex items-center text-amber-400 space-x-1.5">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Round Trip...</span>
                </span>
              )}
              {roundTripCheck.status === 'success' && (
                <span className="flex items-center text-emerald-400 space-x-1.5 bg-emerald-950 px-3 py-1 rounded border border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ROUND TRIP VERIFIED ({roundTripCheck.latencyMs} ms)</span>
                </span>
              )}
              {roundTripCheck.status === 'failure' && (
                <span className="flex items-center text-red-400 space-x-1.5 bg-red-950 px-3 py-1 rounded border border-red-800">
                  <XCircle className="w-4 h-4" />
                  <span>ROUND TRIP FAILED</span>
                </span>
              )}
            </div>

            {roundTripCheck.status === 'success' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-stone-900">
                <div className="p-3 bg-stone-900/90 rounded border border-stone-800 space-y-1">
                  <span className="text-[10px] uppercase text-stone-400 font-semibold">Written Payload</span>
                  <pre className="text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(roundTripCheck.writtenPayload, null, 2)}
                  </pre>
                </div>
                <div className="p-3 bg-stone-900/90 rounded border border-stone-800 space-y-1">
                  <span className="text-[10px] uppercase text-stone-400 font-semibold">Retrieved Payload</span>
                  <pre className="text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(roundTripCheck.retrievedPayload, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {roundTripCheck.status === 'failure' && roundTripCheck.error && (
              <div className="space-y-2 pt-3 border-t border-red-900/60 text-red-300">
                <div>
                  <span className="text-red-400 font-bold uppercase text-[10px]">Error Code:</span>{' '}
                  <code className="text-red-200 bg-red-950 px-1 py-0.5 rounded">
                    {roundTripCheck.error.code}
                  </code>
                </div>
                <div>
                  <span className="text-red-400 font-bold uppercase text-[10px]">Verbatim Error Message:</span>
                  <p className="mt-1 text-[11px] text-red-200 bg-red-950/60 p-2.5 rounded border border-red-900/60 break-all font-mono">
                    {roundTripCheck.error.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Current Authenticated Role Context */}
        <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-medium text-stone-100">
                4. Authenticated Context &amp; Access Controls
              </h2>
            </div>
            <button
              onClick={() => signOut()}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono rounded flex items-center space-x-1 border border-stone-700 transition-colors"
            >
              <LogOut className="w-3 h-3 text-red-400" />
              <span>Sign Out Admin</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-stone-950 rounded border border-stone-800">
              <span className="text-stone-500 uppercase text-[10px]">Authenticated UID</span>
              <p className="text-stone-200 font-semibold mt-1 break-all">{user?.uid}</p>
            </div>
            <div className="p-3 bg-stone-950 rounded border border-stone-800">
              <span className="text-stone-500 uppercase text-[10px]">Admin Email</span>
              <p className="text-amber-300 font-semibold mt-1 break-all">{user?.email}</p>
            </div>
            <div className="p-3 bg-stone-950 rounded border border-stone-800">
              <span className="text-stone-500 uppercase text-[10px]">Firestore Role</span>
              <p className="text-emerald-400 font-semibold mt-1">{role || 'fullAdmin'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
