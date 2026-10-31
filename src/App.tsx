
import React, { useState, useEffect, useRef } from 'react';
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

export default function App() {
  const [profile, setProfile] = useState<CompanyProfile>(
    storage.getProfile
  );
  const [products, setProducts] = useState<Product[]>(
    storage.getProducts
  );
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

  const [lang, setLang] = useState<Language>(storage.getLanguage);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('catalogue');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedComplaintForEdit, setSelectedComplaintForEdit] =
    useState<Complaint | null>(null);

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
        const localLanguage = storage.getLanguage();

        const [
          cloudProfile,
          cloudProducts,
          cloudComplaints,
          cloudCustomers,
          cloudInvoices,
          cloudEstimates,
          cloudTransactions,
          cloudLanguage,
        ] = await Promise.all([
          loadCloudData<CompanyProfile>('profile'),
          loadCloudData<Product[]>('products'),
          loadCloudData<Complaint[]>('complaints'),
          loadCloudData<Customer[]>('customers'),
          loadCloudData<Invoice[]>('invoices'),
          loadCloudData<Estimate[]>('estimates'),
          loadCloudData<Transaction[]>('transactions'),
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
          setProfile(cloudProfile);
          storage.setProfile(cloudProfile);
        } else {
          await saveCloudData('profile', localProfile);
        }

        // Products
        if (cloudProducts !== null) {
          setProducts(cloudProducts);
          storage.setProducts(cloudProducts);
        } else {
          await saveCloudData('products', localProducts);
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

    const existingCust = customers.find(
      (c) => c.mobile === newComplaint.mobile
    );

    if (!existingCust) {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: newComplaint.customerName,
        mobile: newComplaint.mobile,
        businessName: newComplaint.businessName,
        address: newComplaint.serviceLocation,
        notes: `Registered via complaint ticket ${newComplaint.id}`,
        createdAt: new Date().toISOString(),
      };

      const updatedCustomers = [newCust, ...customers];

      setCustomers(updatedCustomers);
      storage.setCustomers(updatedCustomers);
    }
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

  const handleSaveCustomer = (customer: Customer) => {
    const exists = customers.some((c) => c.id === customer.id);

    const updated = exists
      ? customers.map((c) => (c.id === customer.id ? customer : c))
      : [customer, ...customers];

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

    const custExists = customers.some(
      (customer) => customer.mobile === invoice.customerMobile ||
        customer.name.toLowerCase() === invoice.customerName.toLowerCase()
    );
    if (!custExists) {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: invoice.customerName,
        mobile: invoice.customerMobile,
        businessName: invoice.customerBusiness,
        address: invoice.customerAddress,
        gstin: invoice.customerGstin,
        notes: `Created via invoice ${invoice.invoiceNo}`,
        createdAt: new Date().toISOString(),
      };
      const updatedCustomers = [newCust, ...customers];
      setCustomers(updatedCustomers);
      storage.setCustomers(updatedCustomers);
    }
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

  const handleSaveTransaction = (transaction: Transaction) => {
    const updated = [transaction, ...transactions];

    setTransactions(updated);
    storage.setTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);

    setTransactions(updated);
    storage.setTransactions(updated);
  };

  const handleSaveProfile = (newProfile: CompanyProfile) => {
    setProfile(newProfile);
    storage.setProfile(newProfile);
  };

  const handleExportBackup = () => {
    storage.exportBackupJson();
  };

  const handleRestoreBackup = (jsonData: any) => {
    const success = storage.restoreBackupJson(jsonData);

    if (success) {
      setProfile(storage.getProfile());
      setProducts(storage.getProducts());
      setComplaints(storage.getComplaints());
      setCustomers(storage.getCustomers());
      setInvoices(storage.getInvoices());
      setTransactions(storage.getTransactions());
    }

    return success;
  };

  const handleResetDefaults = () => {
    const confirmed = window.confirm(
      'Kya aap sach mein default data restore karna chahte hain? Isse current data replace ho sakta hai.'
    );

    if (!confirmed) return;

    storage.setProfile(DEFAULT_PROFILE);
    storage.setProducts(INITIAL_PRODUCTS);
    storage.setComplaints(INITIAL_COMPLAINTS);
    storage.setCustomers(INITIAL_CUSTOMERS);
    storage.setInvoices(INITIAL_INVOICES);
    storage.setTransactions(INITIAL_TRANSACTIONS);

    setProfile(DEFAULT_PROFILE);
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
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 selection:bg-blue-600 selection:text-white">
      {isAdmin && (
        <div className="px-4 py-2 text-center text-sm bg-gray-900 border-b border-gray-800">
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

      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1">
        {activeTab === 'catalogue' && (
          <CatalogueView
            products={products}
            profile={profile}
            lang={lang}
            onNavigateToComplaint={() => setActiveTab('complaint')}
          />
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
            onExportCsv={exportComplaintsCsv}
            selectedComplaintForEdit={selectedComplaintForEdit}
            onClearSelectedComplaint={() => setSelectedComplaintForEdit(null)}
          />
        )}

        {activeTab === 'customers' && isAdmin && (
          <CustomersView
            customers={customers}
            invoices={invoices}
            complaints={complaints}
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
          <EstimatedProfitView invoices={invoices} products={products} estimates={estimates} customers={customers} profile={profile} onSaveCustomer={handleSaveCustomer} onDeleteEstimate={(estimateId) => { const updated = estimates.filter((item) => item.id !== estimateId); setEstimates(updated); storage.setEstimates(updated); }} onSaveEstimate={(estimate) => { const exists = estimates.some((item) => item.id === estimate.id); const updated = exists ? estimates.map((item) => item.id === estimate.id ? estimate : item) : [estimate, ...estimates]; setEstimates(updated); storage.setEstimates(updated); }} />
        )}

        {activeTab === 'accounts' && isAdmin && (
          <AccountingView
            transactions={transactions}
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
      </main>

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
