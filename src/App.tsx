
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { loadCloudData, saveCloudData } from './lib/cloudStorage';
import { supabase } from './lib/supabaseClient';
import {
  AppTab,
  CompanyProfile,
  Complaint,
  Customer,
  Invoice,
  Estimate,
  Language,
  Product,
  Transaction,
  AntivirusLicense,
  InwardRecord,
  OutwardRecord,
} from './types';
import {
  storage,
  DEFAULT_PROFILE,
  INITIAL_PRODUCTS,
  INITIAL_COMPLAINTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_TRANSACTIONS,
} from './storage';
import { Header } from './components/Header';
import { CatalogueView } from './components/CatalogueView';
import { ComplaintFormView } from './components/ComplaintFormView';
import { DashboardView } from './components/DashboardView';
import { ProductsAdminView } from './components/ProductsAdminView';
import { ComplaintsAdminView } from './components/ComplaintsAdminView';
import { CustomersView } from './components/CustomersView';
import { SalesBillingView } from './components/SalesBillingView';
import { AccountingView } from './components/AccountingView';
import { ReportsView } from './components/ReportsView';
import { EstimatedProfitView } from './components/EstimatedProfitView';
import { SettingsView } from './components/SettingsView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AntivirusView } from './components/AntivirusView';
import { InwardView } from './components/InwardView';
import { OutwardView } from './components/OutwardView';
import { MoreView } from './components/MoreView';
import { QuoteRequestsView } from './components/QuoteRequestsView';
import { sameParty, mergeParty } from './lib/party';
import { ZEBRONICS_CATALOGUE } from './zebronicsCatalogue';

export default function App() {
  const isNativeApp = Capacitor.isNativePlatform();
  const [showBrandSplash, setShowBrandSplash] = useState(true);

  useEffect(() => {
    if (!isNativeApp) {
      setShowBrandSplash(false);
      return;
    }
    const splashTimer = window.setTimeout(() => setShowBrandSplash(false), 2000);
    return () => window.clearTimeout(splashTimer);
  }, [isNativeApp]);
  const BUSINESS_EMAIL = 'info@pctechnotuner.com';
  const [profile, setProfile] = useState<CompanyProfile>(() => ({
    ...storage.getProfile(),
    email: BUSINESS_EMAIL,
  }));
  const mergeZebronicsCatalogue = (items: Product[] | null | undefined) => {
    // Older browser/cloud snapshots may contain empty or malformed rows.
    // Ignore invalid entries so one bad record cannot crash the public website.
    const safeItems = Array.isArray(items)
      ? items.filter((item): item is Product => Boolean(
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          item.id.trim()
        ))
      : [];
    const merged = [...INITIAL_PRODUCTS, ...safeItems, ...ZEBRONICS_CATALOGUE];
    const seen = new Set<string>();
    return merged.filter((item): item is Product => {
      if (!item || typeof item.id !== 'string' || !item.id.trim()) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };
  const [products, setProducts] = useState<Product[]>(() => mergeZebronicsCatalogue(storage.getProducts()));
  const [complaints, setComplaints] = useState<Complaint[]>(
    storage.getComplaints
  );
  const [customers, setCustomers] = useState<Customer[]>(
    storage.getCustomers
  );
  const [invoices, setInvoices] = useState<Invoice[]>(
    storage.getInvoices
  );
  const [estimates, setEstimates] = useState<Estimate[]>(storage.getEstimates);
  const [transactions, setTransactions] = useState<Transaction[]>(
    storage.getTransactions
  );
  const [antivirusLicenses, setAntivirusLicenses] = useState<AntivirusLicense[]>(storage.getAntivirusLicenses);
  const [inwardRecords, setInwardRecords] = useState<InwardRecord[]>(storage.getInwardRecords);
  const [outwardRecords, setOutwardRecords] = useState<OutwardRecord[]>(storage.getOutwardRecords);

  const [lang, setLang] = useState<Language>(storage.getLanguage);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTabState] = useState<AppTab>('catalogue');
  const tabHistory = useRef<AppTab[]>([]);
  const setActiveTab = (next: React.SetStateAction<AppTab>) => {
    setActiveTabState((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      if (resolved !== current) tabHistory.current.push(current);
      return resolved;
    });
  };
  const goBack = () => {
    const previous = tabHistory.current.pop();
    setActiveTabState(previous || 'dashboard');
  };
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedComplaintForEdit, setSelectedComplaintForEdit] =
    useState<Complaint | null>(null);
  const [selectedHomeService, setSelectedHomeService] = useState<string | null>(null);

  const [syncReady, setSyncReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Login required');

  // Public customer complaint page, opened with ?page=complaint.
  const isClientComplaintPage = new URLSearchParams(window.location.search).get('page') === 'complaint';

  // Prevent saving local data while the cloud is still loading.
  const loadingCloudRef = useRef(false);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Check the actual Supabase login session.
  useEffect(() => {
    if (isClientComplaintPage) return;
    let mounted = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session) {
        setIsAdmin(false);
        setActiveTab('catalogue');
        return;
      }

      setIsAdmin(true);
      setActiveTab('dashboard');
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const loggedIn = Boolean(session);
      setIsAdmin(loggedIn);

      if (!loggedIn) {
        setSyncReady(false);
        setSyncStatus('Login required');
        setActiveTab('catalogue');
        setSelectedComplaintForEdit(null);
      } else {
        setActiveTab((current) =>
          current === 'catalogue' ? 'dashboard' : current
        );
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load cloud data after login.
  // If a cloud record does not exist yet, migrate local data once.
  useEffect(() => {
    if (isClientComplaintPage) return;
    if (!isAdmin) {
      loadingCloudRef.current = false;
      setSyncReady(false);
      setSyncStatus('Login required');
      return;
    }

    let cancelled = false;
    loadingCloudRef.current = true;

    const loadAllData = async () => {
      setSyncReady(false);
      setSyncStatus('Cloud data loading...');

      try {
        const {
          data: authData,
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!authData.user) {
          throw new Error('Please log in again.');
        }

        const localProfile = storage.getProfile();
        const localProducts = storage.getProducts();
        const localComplaints = storage.getComplaints();
        const localCustomers = storage.getCustomers();
        const localInvoices = storage.getInvoices();
        const localEstimates = storage.getEstimates();
        const localTransactions = storage.getTransactions();
        const localAntivirusLicenses = storage.getAntivirusLicenses();
        const localInwardRecords = storage.getInwardRecords();
        const localOutwardRecords = storage.getOutwardRecords();
        const localLanguage = storage.getLanguage();

        const [
          cloudProfile,
          cloudProducts,
          cloudComplaints,
          cloudCustomers,
          cloudInvoices,
          cloudEstimates,
          cloudTransactions,
          cloudAntivirusLicenses,
          cloudInwardRecords,
          cloudOutwardRecords,
          cloudLanguage,
        ] = await Promise.all([
          loadCloudData<CompanyProfile>('profile'),
          loadCloudData<Product[]>('products'),
          loadCloudData<Complaint[]>('complaints'),
          loadCloudData<Customer[]>('customers'),
          loadCloudData<Invoice[]>('invoices'),
          loadCloudData<Estimate[]>('estimates'),
          loadCloudData<Transaction[]>('transactions'),
          loadCloudData<AntivirusLicense[]>('antivirus_licenses'),
          loadCloudData<InwardRecord[]>('inward_records'),
          loadCloudData<OutwardRecord[]>('outward_records'),
          loadCloudData<Language>('language'),
        ]);

        // Public complaints are stored separately by the secure Edge Function.
        // Only authenticated admin sessions can read this table (RLS).
        const { data: publicComplaintRows, error: publicComplaintError } = await supabase
          .from('public_complaints')
          .select('payload')
          .order('created_at', { ascending: false });
        if (publicComplaintError) throw publicComplaintError;
        const publicComplaints = (publicComplaintRows || []).map((row: { payload: Complaint }) => row.payload);
        const cloudComplaintsWithPublic = cloudComplaints === null
          ? publicComplaints
          : [...publicComplaints, ...cloudComplaints.filter((item) => !publicComplaints.some((publicItem) => publicItem.id === item.id))];

        if (cancelled) return;

        // Profile
        if (cloudProfile !== null) {
          const updatedCloudProfile = { ...cloudProfile, email: BUSINESS_EMAIL };
          setProfile(updatedCloudProfile);
          storage.setProfile(updatedCloudProfile);
          await saveCloudData('profile', updatedCloudProfile);
        } else {
          await saveCloudData('profile', { ...localProfile, email: BUSINESS_EMAIL });
        }

        // Products
        if (cloudProducts !== null) {
          const productsWithZebronics = mergeZebronicsCatalogue(cloudProducts);
          setProducts(productsWithZebronics);
          storage.setProducts(productsWithZebronics);
          if (productsWithZebronics.length !== cloudProducts.length) {
            await saveCloudData('products', productsWithZebronics);
          }
        } else {
          const productsWithZebronics = mergeZebronicsCatalogue(localProducts);
          setProducts(productsWithZebronics);
          storage.setProducts(productsWithZebronics);
          await saveCloudData('products', productsWithZebronics);
        }

        // Cloud complaints are authoritative. Do not merge stale browser
        // complaints into an intentionally cleared cloud list.
        if (cloudComplaintsWithPublic !== null) {
          setComplaints(cloudComplaintsWithPublic);
          storage.setComplaints(cloudComplaintsWithPublic);
        } else {
          await saveCloudData('complaints', localComplaints);
        }

        // Customers
        if (cloudCustomers !== null) {
          setCustomers(cloudCustomers);
          storage.setCustomers(cloudCustomers);
        } else {
          await saveCloudData('customers', localCustomers);
        }

        // Invoices
        if (cloudInvoices !== null) {
          setInvoices(cloudInvoices);
          storage.setInvoices(cloudInvoices);
        } else {
          await saveCloudData('invoices', localInvoices);
        }

        // Estimates are separate from invoices and never affect stock or accounting.
        if (cloudEstimates !== null) {
          setEstimates(cloudEstimates);
          storage.setEstimates(cloudEstimates);
        } else {
          await saveCloudData('estimates', localEstimates);
        }

        // Transactions
        if (cloudTransactions !== null) {
          setTransactions(cloudTransactions);
          storage.setTransactions(cloudTransactions);
        } else {
          await saveCloudData('transactions', localTransactions);
        }

        // Antivirus licenses
        if (cloudAntivirusLicenses !== null) {
          setAntivirusLicenses(cloudAntivirusLicenses);
          storage.setAntivirusLicenses(cloudAntivirusLicenses);
        } else {
          await saveCloudData('antivirus_licenses', localAntivirusLicenses);
        }

        // Inward service intake records
        if (cloudInwardRecords !== null) {
          setInwardRecords(cloudInwardRecords);
          storage.setInwardRecords(cloudInwardRecords);
        } else {
          await saveCloudData('inward_records', localInwardRecords);
        }

        // Outward service delivery records
        if (cloudOutwardRecords !== null) {
          setOutwardRecords(cloudOutwardRecords);
          storage.setOutwardRecords(cloudOutwardRecords);
        } else {
          await saveCloudData('outward_records', localOutwardRecords);
        }

        // Language
        if (cloudLanguage !== null) {
          setLang(cloudLanguage);
          storage.setLanguage(cloudLanguage);
        } else {
          await saveCloudData('language', localLanguage);
        }

        if (!cancelled) {
          setSyncStatus('Cloud data loaded');
          setSyncReady(true);
        }
      } catch (error) {
        console.error('Cloud load failed:', error);

        if (!cancelled) {
          setSyncReady(false);
          setSyncStatus('Cloud sync failed');

          alert(
            'Cloud data load nahi hua. Internet, login aur Supabase settings check karein. Abhi Reset Defaults mat karein.'
          );
        }
      } finally {
        if (!cancelled) {
          loadingCloudRef.current = false;
        }
      }
    };

    void loadAllData();

    return () => {
      cancelled = true;
      loadingCloudRef.current = false;
    };
  }, [isAdmin]);

  // Publish only customer-safe item names and selling prices for the public quote form.
  useEffect(() => {
    if (!isAdmin || !syncReady) return;
    const publishQuoteCatalogue = async () => {
      const { error: deactivateError } = await supabase
        .from('quote_catalogue')
        .update({ active: false, updated_at: new Date().toISOString() })
        .neq('id', '');
      if (deactivateError) {
        console.error('Quote catalogue refresh failed:', deactivateError);
        return;
      }
      if (products.length === 0) return;
      const { error } = await supabase.from('quote_catalogue').upsert(
        products.map((product) => ({
          id: product.id,
          name: product.name,
          selling_price: product.sellingPrice,
          active: true,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );
      if (error) console.error('Quote catalogue publish failed:', error);
    };
    void publishQuoteCatalogue();
  }, [isAdmin, syncReady, products]);

  // Save changes to Supabase after cloud loading is complete.
  // Saves are queued so they do not intentionally overlap.
  useEffect(() => {
    if (isClientComplaintPage) return;
    if (
      !isAdmin ||
      !syncReady ||
      loadingCloudRef.current
    ) {
      return;
    }

    let cancelled = false;

    const saveSnapshot = async () => {
      if (loadingCloudRef.current || cancelled) return;

      setSyncStatus('Saving to cloud...');

      const task = async () => {
        if (cancelled || loadingCloudRef.current) return;

        await Promise.all([
          saveCloudData('profile', profile),
          saveCloudData('products', products),
          saveCloudData('complaints', complaints),
          saveCloudData('customers', customers),
          saveCloudData('invoices', invoices),
          saveCloudData('estimates', estimates),
          saveCloudData('transactions', transactions),
          saveCloudData('antivirus_licenses', antivirusLicenses),
          saveCloudData('inward_records', inwardRecords),
          saveCloudData('outward_records', outwardRecords),
          saveCloudData('language', lang),
        ]);
      };

      const nextSave = saveQueueRef.current.then(task);
      saveQueueRef.current = nextSave.catch(() => {});

      try {
        await nextSave;

        if (!cancelled) {
          setSyncStatus('Cloud sync successful');
        }
      } catch (error) {
        console.error('Cloud save failed:', error);

        if (!cancelled) {
          setSyncStatus('Cloud save failed');
        }
      }
    };

    void saveSnapshot();

    return () => {
      cancelled = true;
    };
  }, [
    isAdmin,
    syncReady,
    profile,
    products,
    complaints,
    customers,
    invoices,
    estimates,
    transactions,
    antivirusLicenses,
    inwardRecords,
    outwardRecords,
    lang,
  ]);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    storage.setLanguage(newLang);
  };

  // Logout using Supabase authentication.
  const handleSetIsAdmin = async (status: boolean) => {
    if (!status) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert('Logout nahi hua. Internet connection check karein.');
        return;
      }

      setIsAdmin(false);
      setSyncReady(false);
      setActiveTab('catalogue');
      return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (!error && data.session) {
      setIsAdmin(true);
      setActiveTab('dashboard');
    } else {
      setIsAdmin(false);
      setActiveTab('catalogue');
      setLoginModalOpen(true);
    }
  };

  const handleSaveInwardRecord = (record: InwardRecord) => {
    const updated = [record, ...inwardRecords.filter((item) => item.id !== record.id)];
    setInwardRecords(updated);
    storage.setInwardRecords(updated);

    // Link every inward entry to the single party record using mobile identity.
    handleSaveCustomer({
      id: 'cust-' + Date.now(),
      name: record.customerName.trim(),
      mobile: record.phoneNumber.trim(),
      address: '',
      notes: 'Automatically linked from Inward ' + record.id,
      createdAt: new Date().toISOString(),
    });
  };

  const handleSaveOutwardRecord = (record: OutwardRecord) => {
    const updated = [record, ...outwardRecords.filter((item) => item.id !== record.id)];
    setOutwardRecords(updated);
    storage.setOutwardRecords(updated);
  };

  const handleDeleteOutwardRecord = (recordId: string) => {
    const updated = outwardRecords.filter((item) => item.id !== recordId);
    setOutwardRecords(updated);
    storage.setOutwardRecords(updated);
  };

  const handleDeleteInwardRecord = (recordId: string) => {
    const updated = inwardRecords.filter((item) => item.id !== recordId);
    setInwardRecords(updated);
    storage.setInwardRecords(updated);
  };

  const handleSaveProduct = (product: Product) => {
    const exists = products.some((p) => p.id === product.id);

    const updated = exists
      ? products.map((p) => (p.id === product.id ? product : p))
      : [product, ...products];

    setProducts(updated);
    storage.setProducts(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);

    setProducts(updated);
    storage.setProducts(updated);
  };

  const handleQuickUpdateStock = (
    productId: string,
    delta: number
  ) => {
    const updated = products.map((p) =>
      p.id === productId
        ? {
            ...p,
            stockQuantity: Math.max(0, p.stockQuantity + delta),
          }
        : p
    );

    setProducts(updated);
    storage.setProducts(updated);
  };

  // Public complaint submission is still saved locally.
  // Public submissions need a separate secure server-side write policy.
  const handleComplaintSubmitted = (newComplaint: Complaint) => {
    const updatedComplaints = [newComplaint, ...complaints];

    setComplaints(updatedComplaints);
    storage.setComplaints(updatedComplaints);

    handleSaveCustomer({
      id: 'cust-' + Date.now(),
      name: newComplaint.customerName,
      mobile: newComplaint.mobile,
      businessName: newComplaint.businessName,
      address: newComplaint.serviceLocation,
      notes: `Registered via complaint ticket ${newComplaint.id}`,
      createdAt: new Date().toISOString(),
    });
  };

  const handleUpdateComplaint = (
    updatedComplaint: Complaint
  ) => {
    const oldComplaint = complaints.find(
      (c) => c.id === updatedComplaint.id
    );

    const updated = complaints.map((c) =>
      c.id === updatedComplaint.id ? updatedComplaint : c
    );

    setComplaints(updated);
    storage.setComplaints(updated);

    if (
      updatedComplaint.status === 'Resolved' &&
      updatedComplaint.serviceCharges > 0 &&
      (!oldComplaint || oldComplaint.status !== 'Resolved')
    ) {
      const isAlreadyRecorded = transactions.some(
        (t) =>
          t.referenceId === updatedComplaint.id &&
          t.type === 'INCOME'
      );

      if (!isAlreadyRecorded) {
        const incomeCategory =
          updatedComplaint.category === 'CCTV Cameras and DVR/NVR'
            ? 'CCTV installation and service income'
            : 'Computer and laptop repair income';

        const serviceTx: Transaction = {
          id: `tr-${Date.now()}`,
          type: 'INCOME',
          category: incomeCategory,
          amount: updatedComplaint.serviceCharges,
          date:
            updatedComplaint.visitDate ||
            new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
          partyName: updatedComplaint.customerName,
          referenceId: updatedComplaint.id,
          notes: `Service charges collected for ticket ${updatedComplaint.id}`,
          createdAt: new Date().toISOString(),
        };

        const updatedTx = [serviceTx, ...transactions];

        setTransactions(updatedTx);
        storage.setTransactions(updatedTx);
      }
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    try {
      // Public customer tickets live in their own table as well as the cloud sync list.
      // Remove the source row first so it cannot reappear on the next cloud refresh.
      const { error: publicDeleteError } = await supabase
        .from('public_complaints')
        .delete()
        .eq('id', complaintId);

      if (publicDeleteError) throw publicDeleteError;

      const updatedComplaints = complaints.filter((complaint) => complaint.id !== complaintId);
      setComplaints(updatedComplaints);
      storage.setComplaints(updatedComplaints);

      const updatedTransactions = transactions.filter(
        (transaction) => transaction.referenceId !== complaintId
      );
      setTransactions(updatedTransactions);
      storage.setTransactions(updatedTransactions);
      setSyncStatus('Complaint deleted and cloud synced');
    } catch (error) {
      console.error('Complaint delete failed:', error);
      setSyncStatus('Complaint delete failed');
      alert('Complaint delete nahi hua. Cloud permission ya internet connection check karein, phir dobara try karein.');
    }
  };

  const handleSaveCustomer = (customer: Customer) => {
    const matched = customers.find((c) => c.id === customer.id || sameParty(c, customer));
    const merged = mergeParty(matched, customer);
    const updated = matched
      ? customers.map((c) => c.id === matched.id ? merged : c)
      : [merged, ...customers];
    setCustomers(updated);
    storage.setCustomers(updated);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updatedCustomers = customers.filter((customer) => customer.id !== customerId);
    setCustomers(updatedCustomers);
    storage.setCustomers(updatedCustomers);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    const previousInvoice = invoices.find((item) => item.id === invoice.id);
    const updatedInvoices = previousInvoice
      ? invoices.map((item) => item.id === invoice.id ? invoice : item)
      : [invoice, ...invoices];
    setInvoices(updatedInvoices);
    storage.setInvoices(updatedInvoices);

    // Restore the previous invoice quantities, then deduct the edited quantities.
    let currentProducts = [...products];
    if (previousInvoice) {
      previousInvoice.items.forEach((item) => {
        if (!item.productId) return;
        currentProducts = currentProducts.map((product) =>
          product.id === item.productId
            ? { ...product, stockQuantity: product.stockQuantity + Number(item.quantity || 0) }
            : product
        );
      });
    }
    invoice.items.forEach((item) => {
      if (!item.productId) return;
      currentProducts = currentProducts.map((product) =>
        product.id === item.productId
          ? { ...product, stockQuantity: Math.max(0, product.stockQuantity - Number(item.quantity || 0)) }
          : product
      );
    });
    setProducts(currentProducts);
    storage.setProducts(currentProducts);

    // Keep the invoice-linked payment transaction in sync instead of duplicating it.
    const linkedPayment = transactions.find((tx) => tx.referenceId === invoice.invoiceNo && tx.category === 'Product sales');
    let updatedTransactions = transactions.filter((tx) => !(tx.referenceId === invoice.invoiceNo && tx.category === 'Product sales'));
    if (invoice.amountPaid > 0) {
      const salesTx: Transaction = {
        id: linkedPayment?.id || `tr-${Date.now()}`,
        type: 'INCOME',
        category: 'Product sales',
        amount: invoice.amountPaid,
        date: invoice.invoiceDate,
        paymentMethod: invoice.paymentMethod,
        partyName: invoice.customerName,
        referenceId: invoice.invoiceNo,
        notes: `Payment received for Invoice ${invoice.invoiceNo}`,
        createdAt: linkedPayment?.createdAt || new Date().toISOString(),
      };
      updatedTransactions = [salesTx, ...updatedTransactions];
    }
    if (updatedTransactions !== transactions) {
      setTransactions(updatedTransactions);
      storage.setTransactions(updatedTransactions);
    }

    handleSaveCustomer({
      id: 'cust-' + Date.now(),
      name: invoice.customerName,
      mobile: invoice.customerMobile,
      businessName: invoice.customerBusiness,
      address: invoice.customerAddress,
      gstin: invoice.customerGstin,
      notes: `Linked via invoice ${invoice.invoiceNo}`,
      createdAt: new Date().toISOString(),
    });
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;
    const updatedInvoices = invoices.filter((item) => item.id !== invoiceId);
    setInvoices(updatedInvoices);
    storage.setInvoices(updatedInvoices);
    let updatedProducts = [...products];
    invoice.items.forEach((item) => {
      if (!item.productId) return;
      updatedProducts = updatedProducts.map((product) =>
        product.id === item.productId
          ? { ...product, stockQuantity: product.stockQuantity + Number(item.quantity || 0) }
          : product
      );
    });
    setProducts(updatedProducts);
    storage.setProducts(updatedProducts);
    const updatedTransactions = transactions.filter(
      (tx) => !(tx.referenceId === invoice.invoiceNo && tx.category === 'Product sales')
    );
    setTransactions(updatedTransactions);
    storage.setTransactions(updatedTransactions);
  };

  const handleSaveAntivirusLicense = (item: AntivirusLicense) => {
    const updated = antivirusLicenses.some(x => x.id === item.id) ? antivirusLicenses.map(x => x.id === item.id ? item : x) : [item, ...antivirusLicenses];
    setAntivirusLicenses(updated); storage.setAntivirusLicenses(updated);
    handleSaveCustomer({ id: 'cust-' + Date.now(), name: item.customerName, mobile: item.mobile, address: item.address || '', notes: 'Linked via Antivirus License ' + item.id, createdAt: new Date().toISOString() });
  };
  const handleDeleteAntivirusLicense = (id: string) => {
    const updated = antivirusLicenses.filter(x => x.id !== id); setAntivirusLicenses(updated); storage.setAntivirusLicenses(updated);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    const updated = [transaction, ...transactions];
    setTransactions(updated);
    storage.setTransactions(updated);
    if (transaction.partyName?.trim()) {
      handleSaveCustomer({
        id: 'cust-' + Date.now(),
        name: transaction.partyName.trim(),
        mobile: '',
        address: '',
        notes: 'Linked from Accounts entry ' + transaction.id,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);

    setTransactions(updated);
    storage.setTransactions(updated);
  };

  const handleSaveProfile = (newProfile: CompanyProfile) => {
    const updatedProfile = { ...newProfile, email: BUSINESS_EMAIL };
    setProfile(updatedProfile);
    storage.setProfile(updatedProfile);
  };

  const handleExportBackup = () => {
    storage.exportBackupJson();
  };

  const handleRestoreBackup = (jsonData: any) => {
    const success = storage.restoreBackupJson(jsonData);

    if (success) {
      setProfile({ ...storage.getProfile(), email: BUSINESS_EMAIL });
      setProducts(storage.getProducts());
      setComplaints(storage.getComplaints());
      setCustomers(storage.getCustomers());
      setInvoices(storage.getInvoices());
      setEstimates(storage.getEstimates());
      setTransactions(storage.getTransactions());
    }

    return success;
  };

  const handleResetDefaults = () => {
    const confirmed = window.confirm(
      'Kya aap sach mein default data restore karna chahte hain? Isse current data replace ho sakta hai.'
    );

    if (!confirmed) return;

    storage.setProfile({ ...DEFAULT_PROFILE, email: BUSINESS_EMAIL });
    storage.setProducts(INITIAL_PRODUCTS);
    storage.setComplaints(INITIAL_COMPLAINTS);
    storage.setCustomers(INITIAL_CUSTOMERS);
    storage.setInvoices(INITIAL_INVOICES);
    storage.setTransactions(INITIAL_TRANSACTIONS);

    setProfile({ ...DEFAULT_PROFILE, email: BUSINESS_EMAIL });
    setProducts(INITIAL_PRODUCTS);
    setComplaints(INITIAL_COMPLAINTS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setTransactions(INITIAL_TRANSACTIONS);

    alert('Default data restored.');
  };

  const exportProductsCsv = () => {
    const headers = [
      'ID', 'Name', 'Category', 'Brand', 'Model', 'Cost Price',
      'Selling Price', 'Stock Qty', 'Min Alert', 'Warranty (Mo)',
      'Specifications',
    ];

    const rows = products.map((p) => [
      p.id, p.name, p.category, p.brand, p.model, p.purchasePrice,
      p.sellingPrice, p.stockQuantity, p.minStockAlert,
      p.warrantyMonths, p.specifications,
    ]);

    storage.exportToCSV(
      `PC_TECHNO_PRODUCTS_${new Date().toISOString().split('T')[0]}.csv`,
      [headers, ...rows]
    );
  };

  const exportComplaintsCsv = () => {
    const headers = [
      'Ticket ID', 'Customer', 'Mobile', 'Business', 'Category',
      'Brand/Model', 'Serial No', 'Warranty Status', 'Complaint Type',
      'Status', 'Technician', 'Visit Date', 'Service Charge',
      'Location', 'Date Filed',
    ];

    const rows = complaints.map((c) => [
      c.id, c.customerName, c.mobile, c.businessName || '',
      c.category, c.brandModel || '', c.serialNo || '',
      c.warrantyStatus, c.complaintType, c.status,
      c.assignedTechnician || '', c.visitDate || '',
      c.serviceCharges, c.serviceLocation, c.createdAt,
    ]);

    storage.exportToCSV(
      `PC_TECHNO_COMPLAINTS_${new Date().toISOString().split('T')[0]}.csv`,
      [headers, ...rows]
    );
  };

  const exportCustomersCsv = () => {
    const headers = [
      'Customer Name', 'Mobile', 'Business', 'Email',
      'Address', 'GSTIN', 'Created At',
    ];

    const rows = customers.map((c) => [
      c.name, c.mobile, c.businessName || '', c.email || '',
      c.address, c.gstin || '', c.createdAt,
    ]);

    storage.exportToCSV(
      `PC_TECHNO_CUSTOMERS_${new Date().toISOString().split('T')[0]}.csv`,
      [headers, ...rows]
    );
  };

  const exportInvoicesCsv = () => {
    const headers = [
      'Invoice No', 'Date', 'Customer Name', 'Mobile', 'Subtotal',
      'Tax Rate %', 'Tax Amount', 'Discount', 'Total Amount',
      'Amount Paid', 'Balance Due', 'Payment Status', 'Method',
    ];

    const rows = invoices.map((i) => [
      i.invoiceNo, i.invoiceDate, i.customerName, i.customerMobile,
      i.subtotal, i.taxRate, i.taxAmount, i.discount, i.totalAmount,
      i.amountPaid, i.balanceDue, i.paymentStatus, i.paymentMethod,
    ]);

    storage.exportToCSV(
      `PC_TECHNO_INVOICES_${new Date().toISOString().split('T')[0]}.csv`,
      [headers, ...rows]
    );
  };

  const exportAccountingCsv = () => {
    const headers = [
      'Date', 'Type', 'Category', 'Amount', 'Payment Method',
      'Party', 'Reference ID', 'Notes',
    ];

    const rows = transactions.map((t) => [
      t.date, t.type, t.category, t.amount, t.paymentMethod,
      t.partyName, t.referenceId || '', t.notes || '',
    ]);

    storage.exportToCSV(
      `PC_TECHNO_ACCOUNTING_${new Date().toISOString().split('T')[0]}.csv`,
      [headers, ...rows]
    );
  };

  const newComplaintsCount = complaints.filter(
    (c) => c.status === 'New'
  ).length;

  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.minStockAlert
  ).length;

  if (isClientComplaintPage) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 px-4 py-6 sm:py-10">
        <div className="max-w-3xl mx-auto mb-6 text-center">
          <div className="text-xl font-black tracking-wide text-white">PC TECHNO TUNER</div>
          <p className="text-sm text-gray-400 mt-1">Customer Service & Complaint Registration</p>
        </div>
        <ComplaintFormView
          profile={profile}
          lang={lang}
          onComplaintSubmitted={handleComplaintSubmitted}
        />
        <p className="text-center text-xs text-gray-500 mt-8">PC TECHNO TUNER · Ahmedabad</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#07111f] md:bg-[#0b1220] text-gray-100 selection:bg-blue-600 selection:text-white">
      {/* Website pages never show the startup splash on refresh. Native app splash remains unchanged. */}
      {isNativeApp && showBrandSplash && window.location.protocol === 'capacitor:' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020817]">
          <img
            src="./pc-techno-splash.svg"
            alt="PC TECHNO TUNER"
            className="w-full h-full max-w-full max-h-full object-contain"
          />
        </div>
      )}
      {isAdmin && (
        <div className="px-4 py-2 text-center text-sm bg-gray-900 border-b border-gray-800 md:ml-64">
          Cloud status: {syncStatus}
        </div>
      )}

      <Header
        profile={profile}
        lang={lang}
        setLang={handleSetLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={handleSetIsAdmin}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        newComplaintsCount={newComplaintsCount}
        lowStockCount={lowStockCount}
      />

      <main className={`w-full pb-24 md:pb-8 flex-1 ${isAdmin ? "max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 md:ml-64 md:max-w-[calc(100%-16rem)]" : "max-w-none mx-0 p-0"}`}>
        {isAdmin && activeTab !== 'dashboard' && (
          <div className="mb-4 flex items-center">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-blue-500 hover:bg-slate-800 hover:text-white"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        )}
        {!isNativeApp && !isAdmin && activeTab === 'catalogue' && (
          <section className="relative isolate w-full min-h-0 overflow-hidden rounded-b-2xl border border-cyan-400/20 bg-[#030817]">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_20%,rgba(0,190,255,.24),transparent_38%),radial-gradient(ellipse_at_85%_75%,rgba(50,70,210,.28),transparent_42%),linear-gradient(135deg,#030817,#081a36_55%,#10113b)]" />
            <div className="absolute -top-28 -right-20 -z-10 h-96 w-96 rounded-full border border-cyan-400/20" />
            <div className="absolute -bottom-48 -left-20 -z-10 h-96 w-96 rounded-full border border-blue-400/20" />
            <div className="mx-auto flex min-h-0 w-full max-w-screen-2xl items-center px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
              <div className="grid w-full items-center gap-4 lg:grid-cols-[1.35fr_.65fr]">
                <div className="max-w-3xl">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                    <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_#22d3ee]" />
                    Welcome to PC TECHNO TUNER
                  </div>
                  <h1 className="text-xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                    Smart IT Solutions.
                    <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">Reliable Service.</span>
                  </h1>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                    Your trusted technology partner in Ahmedabad for computer and laptop support, CCTV surveillance, IT hardware, networking and Annual Maintenance Contracts.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => document.getElementById('pt-services')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-xl bg-cyan-400 px-7 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300">
                      Explore Services <span aria-hidden="true">→</span>
                    </button>
                    <a href="tel:7383871195" className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 font-bold text-white transition hover:bg-white/10">
                      Contact Us
                    </a>
                  </div>
                  <div className="mt-3 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
                    {['IT Hardware','CCTV Security','Laptop Repairs','AMC Support'].map((item) => (
                      <button key={item} type="button" onClick={() => setSelectedHomeService(item)} aria-label={`View ${item} service details`} className="group rounded-xl border border-white/10 bg-white/[.06] px-3 py-4 text-center text-sm font-semibold text-slate-200 backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-300/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300">
                        {item}<span className="mt-1 block text-[10px] font-medium text-cyan-200 opacity-80 group-hover:opacity-100">View Details ↗</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mx-auto hidden w-full max-w-xs sm:block">
                  <div className="rounded-2xl border border-cyan-200/20 bg-white/[.07] p-4 shadow-[0_25px_100px_rgba(0,150,255,.15)] backdrop-blur-xl">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-300/30 bg-gradient-to-br from-cyan-300/20 to-blue-500/20 text-2xl font-black italic text-cyan-200 shadow-xl">PC</div>
                    <div className="mt-2 text-center">
                      <div className="text-base font-black tracking-wide text-white">PC TECHNO TUNER</div>
                      <div className="mt-2 text-sm font-medium text-cyan-200">Technology • Security • Support</div>
                      <p className="mt-2 text-xs leading-5 text-slate-300">Complete technology care for homes, offices and businesses — from setup and installation to repair and ongoing support.</p>
                    </div>
                    <div className="mt-3 border-t border-white/10 pt-3 text-center text-xs text-slate-300">
                      <span className="font-semibold text-white">Serving Ahmedabad, Gujarat</span>
                      <div className="mt-2">Call: 73838 71195</div>
                      <a href={`mailto:${profile.email}`} className="mt-2 inline-block break-all text-cyan-200 hover:text-white hover:underline">{profile.email}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'catalogue' && (
          <div id="pt-services">
          <CatalogueView
            products={products}
            profile={profile}
            lang={lang}
            onNavigateToComplaint={() => setActiveTab('complaint')}
            onNavigateToQuote={() => setActiveTab('quote')}
          />
          </div>
        )}


        {activeTab === 'quote' && (
          <QuoteRequestsView isAdmin={false} products={products} profile={profile} />
        )}

        {activeTab === 'quotes' && isAdmin && (
          <QuoteRequestsView isAdmin={true} products={products} profile={profile} />
        )}

        {activeTab === 'complaint' && (
          <ComplaintFormView
            profile={profile}
            lang={lang}
            onComplaintSubmitted={handleComplaintSubmitted}
          />
        )}

        {activeTab === 'dashboard' && isAdmin && (
          <DashboardView
            products={products}
            complaints={complaints}
            customers={customers}
            invoices={invoices}
            transactions={transactions}
            inwardRecords={inwardRecords}
            outwardRecords={outwardRecords}
            antivirusLicenses={antivirusLicenses}
            estimates={estimates}
            profile={profile}
            lang={lang}
            onNavigateTab={setActiveTab}
            onSelectComplaintForEdit={(c) => {
              setSelectedComplaintForEdit(c);
              setActiveTab('complaints');
            }}
            onOpenNewProductModal={() => setActiveTab('products')}
            onOpenNewInvoiceModal={() => setActiveTab('sales')}
            onOpenNewTransactionModal={() => setActiveTab('accounts')}
            onExportBackup={handleExportBackup}
          />
        )}

        {activeTab === 'products' && isAdmin && (
          <ProductsAdminView
            products={products}
            lang={lang}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onExportCsv={exportProductsCsv}
            onQuickUpdateStock={handleQuickUpdateStock}
          />
        )}

        {activeTab === 'complaints' && isAdmin && (
          <ComplaintsAdminView
            complaints={complaints}
            profile={profile}
            lang={lang}
            onUpdateComplaint={handleUpdateComplaint}
            onDeleteComplaint={handleDeleteComplaint}
            onExportCsv={exportComplaintsCsv}
            selectedComplaintForEdit={selectedComplaintForEdit}
            onClearSelectedComplaint={() => setSelectedComplaintForEdit(null)}
          />
        )}

        {activeTab === 'customers' && isAdmin && (
          <CustomersView
            customers={customers}
            invoices={invoices}
            estimates={estimates}
            transactions={transactions}
            antivirusLicenses={antivirusLicenses}
            complaints={complaints}
            inwardRecords={inwardRecords}
            outwardRecords={outwardRecords}
            lang={lang}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onExportCsv={exportCustomersCsv}
          />
        )}

        {activeTab === 'sales' && isAdmin && (
          <SalesBillingView
            invoices={invoices}
            products={products}
            customers={customers}
            profile={profile}
            lang={lang}
            onSaveProduct={handleSaveProduct}
            onSaveInvoice={handleSaveInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onSaveCustomer={handleSaveCustomer}
            onExportCsv={exportInvoicesCsv}
          />
        )}

        {activeTab === 'profit' && isAdmin && (
          <EstimatedProfitView invoices={invoices} products={products} estimates={estimates} customers={customers} profile={profile} onSaveCustomer={handleSaveCustomer} onDeleteEstimate={(estimateId) => { const updated = estimates.filter((item) => item.id !== estimateId); setEstimates(updated); storage.setEstimates(updated); }} onSaveEstimate={(estimate) => { const exists = estimates.some((item) => item.id === estimate.id); const updated = exists ? estimates.map((item) => item.id === estimate.id ? estimate : item) : [estimate, ...estimates]; setEstimates(updated); storage.setEstimates(updated); handleSaveCustomer({ id: 'cust-' + Date.now(), name: estimate.customerName, mobile: estimate.customerMobile, businessName: estimate.customerBusiness, address: estimate.customerAddress || '', gstin: estimate.customerGstin, notes: 'Linked via Estimate ' + estimate.estimateNo, createdAt: new Date().toISOString() }); }} />
        )}

        {activeTab === 'inward' && isAdmin && (
          <InwardView
            records={inwardRecords}
            customers={customers}
            onSaveRecord={handleSaveInwardRecord}
            onDeleteRecord={handleDeleteInwardRecord}
          />
        )}

        {activeTab === 'outward' && isAdmin && (
          <OutwardView
            inwardRecords={inwardRecords}
            outwardRecords={outwardRecords}
            onSaveRecord={handleSaveOutwardRecord}
            onDeleteRecord={handleDeleteOutwardRecord}
          />
        )}

        {activeTab === 'antivirus' && isAdmin && (
          <AntivirusView licenses={antivirusLicenses} onSave={handleSaveAntivirusLicense} onDelete={handleDeleteAntivirusLicense} />
        )}

        {activeTab === 'accounts' && isAdmin && (
          <AccountingView
            transactions={transactions}
            invoices={invoices}
            lang={lang}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onExportCsv={exportAccountingCsv}
          />
        )}

        {activeTab === 'reports' && isAdmin && (
          <ReportsView
            invoices={invoices}
            transactions={transactions}
            products={products}
            lang={lang}
            onExportCsv={exportAccountingCsv}
          />
        )}

        {activeTab === 'more' && isAdmin && (
          <MoreView
            onOpenNewProduct={() => setActiveTab('products')}
            onOpenNewInvoice={() => setActiveTab('sales')}
            onOpenNewTransaction={() => setActiveTab('accounts')}
            onExportBackup={handleExportBackup}
          />
        )}

        {activeTab === 'settings' && isAdmin && (
          <SettingsView
            profile={profile}
            lang={lang}
            onSaveProfile={handleSaveProfile}
            onExportBackup={handleExportBackup}
            onRestoreBackup={handleRestoreBackup}
            onResetDefaults={handleResetDefaults}
          />
        )}
        <footer className="mt-8 border-t border-slate-800/80 py-4 text-center">
          <p className="text-[11px] font-semibold tracking-wider text-slate-500">
            Powered by <a href="https://pctechnotuner-lgtm.github.io/Pc-Techno-Tuner/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline">PC TECHNO TUNER</a>
          </p>
        </footer>
      </main>

      {isAdmin && (
        <nav aria-label="Mobile admin navigation" className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-blue-900/70 bg-[#081426]/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.35)] safe-area-bottom">
          <div className="grid grid-cols-5 max-w-xl mx-auto px-1 py-2">
            {([
              ['dashboard', 'Home'],
              ['products', 'Items'],
              ['complaints', 'Tickets'],
              ['sales', 'Sales'],
              ['profit', 'Estimate']
            ] as [AppTab, string][]).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition ${activeTab === tab ? 'bg-blue-600/20 text-blue-300' : 'text-slate-400 hover:text-white'}`} aria-current={activeTab === tab ? 'page' : undefined}>
                <span className="text-base leading-none">{tab === 'dashboard' ? '⌂' : tab === 'products' ? '▦' : tab === 'complaints' ? '⚒' : tab === 'sales' ? '▤' : '↗'}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {selectedHomeService && (() => {
        const serviceDetails: Record<string, { intro: string; items: string[] }> = {
          'IT Hardware': { intro: 'Complete hardware supply, installation and support for homes, shops and offices.', items: ['Desktop computers, laptops and branded accessories', 'Printers, scanners, UPS, RAM, SSD and components', 'Server hardware, upgrades and new system setup', 'Hardware troubleshooting, maintenance and AMC'] },
          'CCTV Security': { intro: 'Plan, install and maintain CCTV surveillance systems to help protect your premises.', items: ['IP and HD CCTV camera installation', 'DVR / NVR setup, recording and playback support', 'Remote viewing on mobile and desktop', 'Camera networking, cabling and repair / maintenance'] },
          'Laptop Repairs': { intro: 'Practical laptop diagnosis, repair and upgrade support for personal and business devices.', items: ['Laptop diagnosis and hardware troubleshooting', 'Screen, keyboard, battery and charging repairs', 'SSD / RAM upgrades and operating-system installation', 'Software, driver, data-transfer and performance support'] },
          'AMC Support': { intro: 'Planned IT maintenance and ongoing technical support to keep business systems running smoothly.', items: ['Regular preventive computer maintenance', 'Desktop, laptop, printer and network support', 'Troubleshooting and service-visit coordination', 'AMC plans tailored to business requirements'] },
        };
        const details = serviceDetails[selectedHomeService];
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onClick={() => setSelectedHomeService(null)}>
            <section role="dialog" aria-modal="true" aria-labelledby="home-service-title" className="w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-300/25 bg-[#0b1730] shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 p-5">
                <div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">PC TECHNO TUNER • Our Services</p><h2 id="home-service-title" className="mt-2 text-2xl font-black text-white">{selectedHomeService}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{details.intro}</p></div>
                <button type="button" onClick={() => setSelectedHomeService(null)} aria-label="Close service details" className="rounded-lg border border-white/15 px-3 py-2 text-lg text-slate-200 hover:bg-white/10">✕</button>
              </div>
              <div className="p-5"><h3 className="mb-3 text-sm font-bold text-cyan-200">What we offer</h3><ul className="space-y-3">{details.items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-200"><span className="mt-0.5 text-cyan-300">✓</span><span>{item}</span></li>)}</ul>
                <div className="mt-6 flex flex-wrap gap-3"><a href={`https://wa.me/917383871195?text=${encodeURIComponent('Hello PC TECHNO TUNER, I need information about ' + selectedHomeService)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">Enquire on WhatsApp ↗</a><a href="tel:7383871195" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Call 73838 71195</a></div>
                <p className="mt-4 text-xs text-slate-400">Serving Ahmedabad, Gujarat • info@pctechnotuner.com</p>
              </div>
            </section>
          </div>
        );
      })()}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}
