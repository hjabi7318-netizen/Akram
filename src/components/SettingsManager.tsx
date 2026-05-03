import { useState, useEffect } from "react";
import { storage } from "@/src/lib/storage";
import { Settings, Settings2, Save, X } from "lucide-react";
import { COMPANY_DETAILS } from "@/src/types";

export function SettingsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(storage.getSettings());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(storage.getSettings());
    }
  }, [isOpen]);

  const handleSave = async () => {
    setLoading(true);
    try {
      storage.saveSettings(formData);
      // Small delay for UI feel
      setTimeout(() => {
        setIsOpen(false);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error saving settings", error);
      alert("Failed to save settings.");
      setLoading(false);
    }
  };

  const fields = [
    { label: "Company Name (EN) / اسم الشركة", key: "name" },
    { label: "Company Name (AR) / اسم الشركة بالعربي", key: "nameAr" },
    { label: "Building / مبنى", key: "building" },
    { label: "Street / شارع", key: "street" },
    { label: "District / منطقة", key: "district" },
    { label: "City / مدينة", key: "city" },
    { label: "Country / دولة", key: "country" },
    { label: "Postal Code / رمز بريدي", key: "postalCode" },
    { label: "Additional No / رقم إضافي", key: "additionalNo" },
    { label: "VAT Number / رقم ضريبة", key: "vatNumber" },
    { label: "CRN / السجل التجاري", key: "crn" },
    { label: "Other ID / معرف آخر", key: "otherId" },
    { label: "Phone / الهاتف", key: "phone" },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 no-print text-left">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-4 sm:p-8 space-y-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-white pb-2 flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-blue-600" />
                Seller Profile
              </h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 px-2 text-gray-400 hover:text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-all"
              >
                CLOSE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                {fields.map(field => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{field.label}</label>
                    <input 
                      type="text" 
                      value={(formData as any)[field.key]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 flex-shrink-0 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
