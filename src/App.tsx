import { useState, useEffect } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useNavigate, 
  useParams, 
  useLocation 
} from "react-router-dom";
import { 
  LogIn, 
  LogOut, 
  Plus, 
  FileText, 
  Download, 
  Printer, 
  ChevronLeft, 
  Search,
  LayoutDashboard,
  Trash2,
  Lock,
  User as UserIcon
} from "lucide-react";
import { storage } from "@/src/lib/storage";
import { Order } from "@/src/types";
import { OrderForm } from "@/src/components/OrderForm";
import { Invoice } from "@/src/components/Invoice";
import { SettingsManager } from "@/src/components/SettingsManager";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedOrders = storage.getOrders();
    setOrders(savedOrders);
  }, []);

  // Poll for orders or use a custom event if needed
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setOrders(storage.getOrders());
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const [loginLoading, setLoginLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const ENV_USERNAME = (import.meta as any).env.VITE_APP_USERNAME || "8080";
    const ENV_PASSWORD = (import.meta as any).env.VITE_APP_PASSWORD || "1234";

    setTimeout(() => {
      if (username === ENV_USERNAME && password === ENV_PASSWORD) {
        const newUser = { id: "1", username: ENV_USERNAME, displayName: "Administrator" };
        setUser(newUser);
      } else {
        setLoginError("Invalid username or password");
      }
      setLoginLoading(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
  };
  
  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      storage.deleteOrder(orderId);
      setOrders(storage.getOrders());
      if (location.pathname !== "/") {
        navigate("/");
      }
    }
  };

  const handleDownloadPdf = async (orderId: string) => {
    setIsPrinting(true);
    try {
      // In a real local storage app, the server won't have the order.
      // So we might need to send the order data to the server or just use browser print.
      // For now, since this is a migration, I'll keep the logic but it might fail if the server logic 
      // depends strictly on Firebase. If it fails, I'll suggest browser print.
      
      const order = storage.getOrder(orderId);
      if (!order) throw new Error("Order not found");

      // Attempting to use the existing PDF endpoint by passing data or assuming it might work if updated
      // If we don't have a backend that supports local storage data, we'll just handle it gracefully.
      const response = await fetch(`/api/pdf/${orderId}`);
      
      if (!response.ok) {
        throw new Error("PDF server requires cloud sync. Please use Print -> Save as PDF instead.");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PurchaseOrder-${orderId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("[PDF CLIENT ERROR]", error);
      alert(error instanceof Error ? error.message : "Use browser Print (Ctrl+P) to save as PDF.");
    } finally {
      setIsPrinting(false);
    }
  };

  if (!user && !location.search.includes("print=true")) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto">
              <img src="https://i.ibb.co/B5HydyBJ/Screenshot-20260502-233632.jpg" alt="QR Grand Mart Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">QR Grand Mart</h1>
              <p className="text-gray-500">Sign in to manage invoices</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  placeholder="Username"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  placeholder="••••"
                  required
                />
              </div>
            </div>

            {loginError && (
              <p className="text-red-500 text-sm font-semibold text-center">{loginError}</p>
            )}

            <button 
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-gray-200"
            >
              {loginLoading ? "Verifying..." : "Secure Login"}
            </button>
          </form>
          
          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
            Local Management Console v2.0
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="min-h-screen bg-gray-50 flex flex-col no-print">
          <NavBar user={user} logout={logout} navigate={navigate} />
          <Dashboard orders={orders} handleDownloadPdf={handleDownloadPdf} handleDeleteOrder={handleDeleteOrder} isPrinting={isPrinting} navigate={navigate} />
        </div>
      } />
      <Route path="/new" element={
        <div className="min-h-screen bg-gray-50 flex flex-col no-print">
          <NavBar user={user} logout={logout} navigate={navigate} />
          <main className="flex-1 max-w-4xl w-full mx-auto p-6">
            <OrderForm user={user} onOrderCreated={(id) => navigate(`/order/${id}`)} />
          </main>
        </div>
      } />
      <Route path="/order/:id" element={<InvoiceWrapper handleDownloadPdf={handleDownloadPdf} handleDeleteOrder={handleDeleteOrder} isPrinting={isPrinting} user={user} logout={logout} navigate={navigate} />} />
    </Routes>
  );
}

function NavBar({ user, logout, navigate }: any) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => navigate("/")}>
        <div className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110 duration-200">
          <img src="https://i.ibb.co/B5HydyBJ/Screenshot-20260502-233632.jpg" alt="QR Grand Mart Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        </div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight italic">QR Grand Mart</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => navigate("/")}
          className="hidden sm:block px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Dashboard
        </button>
        <button 
          onClick={() => navigate("/new")}
          className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> <span className="hidden xs:inline">New PO</span>
        </button>
        <div className="h-6 w-px bg-gray-200 mx-1 md:mx-2 hidden sm:block"></div>
      <div className="flex items-center gap-2 md:gap-3">
        <SettingsManager />
        {user?.photoURL ? (
          <img src={user.photoURL} className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-200" alt="Avatar" />
        ) : (
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-400">
            {user?.email?.[0].toUpperCase() || "?"}
          </div>
        )}
        <button onClick={logout} className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      </div>
    </nav>
  );
}

function Dashboard({ orders, handleDownloadPdf, handleDeleteOrder, isPrinting, navigate }: any) {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20 md:pb-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Recent Purchase Orders</h2>
            <p className="text-xs md:text-sm text-gray-500">Manage and track your retail orders</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by PO #..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">PO #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-blue-600 cursor-pointer" onClick={() => navigate(`/order/${order.id}`)}>{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{order.customerName}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">{order.customerVat || "No VAT ID"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.createdAt ? format(order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt), "MMM dd, yyyy") : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      {order.items.length} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    SAR {order.grandTotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button 
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDownloadPdf(order.id!)}
                        disabled={isPrinting}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id!);
                        }}
                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden space-y-4">
          {orders.map((order: any) => (
            <motion.div 
              key={order.id}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-lg font-bold text-blue-600 leading-none mb-1">{order.orderNumber}</div>
                  <div className="text-xs text-gray-400">
                    {order.createdAt ? format(order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt), "MMM dd, yyyy") : "N/A"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900 leading-none">SAR {order.grandTotal.toFixed(2)}</div>
                  <div className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                    {order.items.length} items
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-50 flex flex-col gap-1">
                <div className="font-bold text-gray-800 text-sm">{order.customerName}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest">{order.customerVat || "NO VAT ID"}</div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/order/${order.id}`);
                  }}
                  className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPdf(order.id!);
                  }}
                  disabled={isPrinting}
                  className="flex-1 py-2.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrder(order.id!);
                  }}
                  className="w-12 py-2.5 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {orders.length === 0 && (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No invoices found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search or create a new PO</p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}

function InvoiceWrapper({ handleDownloadPdf, handleDeleteOrder, isPrinting, user, logout, navigate }: any) {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const location = useLocation();
  const isPrintView = location.search.includes("print=true");

  useEffect(() => {
    if (id) {
      const foundOrder = storage.getOrder(id);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        console.error("[DEBUG] Order not found for ID:", id);
      }
    }
  }, [id]);

  if (!order) return <div className="p-20 text-center font-bold text-gray-400 animate-pulse">Loading Purchase Order...</div>;

  if (isPrintView) {
    return <Invoice order={order} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col no-print">
      <NavBar user={user} logout={logout} navigate={navigate} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Dashboard
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                 onClick={() => handleDeleteOrder(order.id!)}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-red-500 hover:text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" /> <span className="hidden xs:inline">Delete</span>
              </button>
              <button 
                 onClick={() => window.print()}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 text-sm"
              >
                <Printer className="w-4 h-4" /> <span className="hidden xs:inline">Print</span>
              </button>
              <button 
                 disabled={isPrinting}
                 onClick={() => handleDownloadPdf(order.id!)}
                 className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm"
              >
                {isPrinting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden xs:inline">PDF</span><span className="xs:hidden">Get PDF</span>
              </button>
            </div>
          </div>
          <div className="bg-gray-200 p-2 sm:p-4 md:p-12 rounded-2xl md:rounded-3xl overflow-auto border-2 md:border-4 border-gray-300">
            <Invoice order={order} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
