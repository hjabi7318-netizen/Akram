import { useState, useMemo, FormEvent } from "react";
import { Plus, Trash2, Save, ShoppingCart, User, Hash, MapPin } from "lucide-react";
import { InvoiceItem, Order } from "@/src/types";
import { generateZatcaTLV } from "@/src/lib/zatca";
import { storage } from "@/src/lib/storage";
import { motion, AnimatePresence } from "motion/react";
import { useCompanySettings } from "@/src/lib/useSettings";

import { translateToArabic } from "@/src/services/translationService";

export function OrderForm({ onOrderCreated, user }: { onOrderCreated: (id: string) => void, user: any }) {
  const company = useCompanySettings();
  const [customerName, setCustomerName] = useState("");
  const [customerVat, setCustomerVat] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: Math.random().toString(36).substr(2, 9), description: "", qty: 1, unitPrice: 0, vatRate: 15 }
  ]);
  const [loading, setLoading] = useState(false);

  const calculatedItems = useMemo(() => {
    return items.map(item => {
      const qty = item.qty || 0;
      const unitPrice = item.unitPrice || 0;
      const vatRate = item.vatRate || 0;
      const subtotal = qty * unitPrice;
      const vatAmount = subtotal * (vatRate / 100);
      const total = subtotal + vatAmount;
      return { ...item, vatAmount, total } as InvoiceItem;
    });
  }, [items]);

  const totals = useMemo(() => {
    const subTotal = calculatedItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
    const totalVat = calculatedItems.reduce((acc, item) => acc + item.vatAmount, 0);
    const grandTotal = subTotal + totalVat;
    return { subTotal, totalVat, grandTotal };
  }, [calculatedItems]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: "", qty: 1, unitPrice: 0, vatRate: 15 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  const handleTranslateDescription = async (id: string, description: string) => {
    if (!description || description.trim().length < 2) return;
    
    setTranslatingIds(prev => new Set(prev).add(id));
    try {
      const translation = await translateToArabic(description);
      if (translation) {
        updateItem(id, "descriptionAr", translation);
      }
    } catch (error) {
      console.error("Auto-translation failed", error);
    } finally {
      setTranslatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in first");
      return;
    }
    
    setLoading(true);
    try {
      const orderNumber = `PO-${Date.now().toString().slice(-6)}`;
      const timestamp = new Date().toISOString();
      
      const qrData = generateZatcaTLV(
        company.name,
        company.vatNumber,
        timestamp,
        totals.grandTotal.toFixed(2),
        totals.totalVat.toFixed(2)
      );

        const orderData: Order = {
        orderNumber,
        createdAt: timestamp,
        dueDate: dueDate || timestamp,
        paymentMethod,
        customerName,
        customerVat,
        customerLocation,
        items: calculatedItems,
        ...totals,
        cashier: user.displayName || user.username || "Unknown",
        status: 'paid', // Keep internal status
        qrData
      };

      const orderId = storage.saveOrder(orderData);
      onOrderCreated(orderId);
      
      // Reset form
      setCustomerName("");
      setCustomerVat("");
      setCustomerLocation("");
      setDueDate("");
      setPaymentMethod("Cash");
      setItems([{ id: Math.random().toString(36).substr(2, 9), description: "", qty: 1, unitPrice: 0, vatRate: 15 }]);
      
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gray-900 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">New Purchase Order</h2>
        </div>
        <div className="text-sm font-mono text-gray-400">
          VAT: {company.vatNumber}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
              <User className="w-3 h-3" /> Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
              <Hash className="w-3 h-3" /> Customer VAT (Optional)
            </label>
            <input
              type="text"
              value={customerVat}
              onChange={(e) => setCustomerVat(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="15-digit VAT number"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Customer Location
            </label>
            <input
              type="text"
              value={customerLocation}
              onChange={(e) => setCustomerLocation(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="City, Area, Street..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-gray-500">Items</label>
              <div className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </div>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">ITEM {index + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id!)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id!, "description", e.target.value)}
                        onBlur={(e) => handleTranslateDescription(item.id!, e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Product name..."
                        required
                      />
                      {item.descriptionAr ? (
                        <div className="text-[11px] text-blue-600 px-1 font-arabic" dir="rtl">
                          {item.descriptionAr}
                        </div>
                      ) : translatingIds.has(item.id!) && (
                        <div className="text-[10px] text-gray-400 px-1 animate-pulse italic">
                          Translating to Arabic...
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Quantity</label>
                        <input
                          type="number"
                          value={item.qty || ""}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateItem(item.id!, "qty", isNaN(val) ? "" : val);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-center font-bold text-sm"
                          min="1"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Unit Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">SAR</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              updateItem(item.id!, "unitPrice", isNaN(val) ? "" : val);
                            }}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-right font-bold text-sm"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total (Inc. VAT)</label>
                        <div className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-xl font-mono font-bold text-center text-sm border border-blue-100">
                          SAR {((item.qty || 0) * (item.unitPrice || 0) * 1.15).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 text-white space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal:</span>
            <span>SAR {totals.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">VAT (15%):</span>
            <span>SAR {totals.totalVat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold border-t border-gray-800 pt-3">
            <span>Total Payable:</span>
            <span className="text-blue-400">SAR {totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || translatingIds.size > 0}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving Order...</span>
            </div>
          ) : translatingIds.size > 0 ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Translating items...</span>
            </div>
          ) : (
            <>
              <Save className="w-5 h-5" /> Finalize Purchase Order
            </>
          )}
        </button>
      </div>
    </form>
  );
}
