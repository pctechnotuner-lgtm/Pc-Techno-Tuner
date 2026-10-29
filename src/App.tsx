
import React, { useState, useEffect } from 'react';
import {
  AppTab,
  CompanyProfile,
  Complaint,
  Customer,
  Invoice,
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
import { supabase } from './lib/supabaseClient';
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
import { SettingsView } from './components/SettingsView';
import { AdminLoginModal } from './components/AdminLoginModal';

export default function App() {
  const [profile, setProfile] = useState<CompanyProfile>(storage.getProfile);
  const [products, setProducts] = useState<Product[]>(storage.getProducts);
  const [complaints, setComplaints] = useState<Complaint[]>(storage.getComplaints);
  const [customers, setCustomers] = useState<Customer[]>(storage.getCustomers);
  const [invoices, setInvoices] = useState<Invoice[]>(storage.getInvoices);
  const [transactions, setTransactions] = useState<Transaction[]>(storage.getTransactions);

  const [lang, setLang] = useState<Language>(storage.getLanguage);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AppTab>('catalogue');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedComplaintForEdit, setSelectedComplaintForEdit] =
    useState<Complaint | null>(null);

  // Use the real Supabase session for login state.
  useEffect(() => {
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

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    storage.setLanguage(newLang);
  };

  // Logout through Supabase, not a localStorage flag.
  const handleSetIsAdmin = async (status: boolean) => {
    if (!status) {
      const { error } = await supabase.auth.signOut();

      if (error) {
        alert('Logout nahi hua. Internet connection check karein.');
        return;
      }

      setIsAdmin(false);
      setActiveTab('catalogue');
      return;
    }

    // Do not grant admin access just by setting a local flag.
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

  const handleQuickUpdateStock = (productId: string, delta: number) => {
    const updated = products.map((p) =>
      p.id === productId
        ? { ...p, stockQuantity: Math.max(0, p.stockQuantity + delta) }
        : p
    );

    setProducts(updated);
    storage.setProducts(updated);
  };

  // Public complaint submission. This still uses local storage for now.
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

  const handleUpdateComplaint = (updatedComplaint: Complaint) => {
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
          t.referenceId === updatedComplaint.id && t.type === 'INCOME'
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

  const handleSaveInvoice = (invoice: Invoice) => {
    const updatedInvoices = [invoice, ...invoices];
    setInvoices(updatedInvoices);
    storage.setInvoices(updatedInvoices);

    let currentProducts = [...products];

    invoice.items.forEach((item) => {
      if (item.productId) {
        currentProducts = currentProducts.map((p) =>
          p.id === item.productId
            ? {
                ...p,
                stockQuantity: Math.max(
                  0,
                  p.stockQuantity - item.quantity
                ),
              }
            : p
        );
      }
    });

    setProducts(currentProducts);
    storage.setProducts(currentProducts);

    if (invoice.amountPaid > 0) {
      const salesTx: Transaction = {
        id: `tr-${Date.now()}`,
        type: 'INCOME',
        category: 'Product sales',
        amount: invoice.amountPaid,
        date: invoice.invoiceDate,
        paymentMethod: invoice.paymentMethod,
        partyName: invoice.customerName,
        referenceId: invoice.invoiceNo,
        notes: `Payment received for Invoice ${invoice.invoiceNo}`,
        createdAt: new Date().toISOString(),
      };

      const updatedTx = [salesTx, ...transactions];
      setTransactions(updatedTx);
      storage.setTransactions(updatedTx);
    }

    const custExists = customers.some(
      (c) =>
        c.mobile === invoice.customerMobile ||
        c.name.toLowerCase() === invoice.customerName.toLowerCase()
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

    alert('System reloaded with default PC TECHNO TUNER seed data.');
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100 selection:bg-blue-600 selection:text-white">
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
            onSaveInvoice={handleSaveInvoice}
            onExportCsv={exportInvoicesCsv}
          />
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
