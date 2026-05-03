import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { useCompanySettings } from "@/src/lib/useSettings";
import { Order } from "@/src/types";

interface InvoiceProps {
  order: Order;
}

export function Invoice({ order }: InvoiceProps) {
  const settings = useCompanySettings();
  const { name, nameAr, location, locationAr, vatNumber, phone } = settings;

  return (
    <div className="invoice-ready bg-white p-8 w-[210mm] min-h-[297mm] mx-auto shadow-sm print:shadow-none print:p-0 font-sans leading-tight text-gray-900">
      <table className="w-full border-none border-separate border-spacing-0">
        <thead>
          <tr>
            <td className="border-none">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
                <div className="flex items-start gap-4">
                  <img src="https://i.ibb.co/B5HydyBJ/Screenshot-20260502-233632.jpg" alt="Logo" className="w-20 h-20 object-contain print:block" referrerPolicy="no-referrer" />
                  <div className="text-left">
                    <h1 className="text-2xl font-bold">{name}</h1>
                    <p className="text-sm text-gray-600">{location}</p>
                    <p className="text-sm text-gray-600">VAT: {vatNumber}</p>
                    <p className="text-sm text-gray-600">Tel: {phone}</p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end">
                  <h1 className="text-2xl font-bold font-arabic" dir="rtl">{nameAr}</h1>
                  <p className="text-sm text-gray-600 font-arabic" dir="rtl">{locationAr}</p>
                  <p className="text-sm text-gray-600 font-arabic" dir="rtl">الرقم الضريبي: {vatNumber}</p>
                  <p className="text-sm text-gray-600 font-arabic" dir="rtl">هاتف: {phone}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold underline decoration-1 underline-offset-4 uppercase">PURCHASE ORDER / أمر شراء</h2>
              </div>

              {/* Seller and PO Details */}
              <div className="grid grid-cols-2 gap-12 mb-8 text-[11px]">
                {/* Seller Area (Left) */}
                <div className="text-left border border-gray-200 p-4 rounded-sm flex-1">
                  <div className="flex justify-between border-b border-gray-800 mb-3 uppercase text-xs font-bold">
                    <span>Seller :</span>
                    <span className="font-arabic">البائع :</span>
                  </div>
                  <div className="space-y-1.5 leading-normal italic text-[10px]">
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="font-bold flex gap-2">Name : <span className="font-semibold not-italic">{name}</span></span>
                      <span className="font-arabic">اسم</span>
                    </div>
                    {settings.building && (
                      <div className="flex justify-between border-b border-gray-50 pb-0.5">
                        <span className="font-bold flex gap-2">Building : <span className="font-semibold not-italic">{settings.building}</span></span>
                        <span className="font-arabic">مبنى</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="font-bold flex gap-2">Street : <span className="font-semibold not-italic">{settings.street}</span></span>
                      <span className="font-arabic">شارع</span>
                    </div>
                    {settings.district && (
                      <div className="flex justify-between border-b border-gray-50 pb-0.5">
                        <span className="font-bold flex gap-2">District : <span className="font-semibold not-italic">{settings.district}</span></span>
                        <span className="font-arabic">منطقة</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="font-bold flex gap-2">City : <span className="font-semibold not-italic">{settings.city}</span></span>
                      <span className="font-arabic">مدينة</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-0.5">
                      <span className="font-bold flex gap-2">Country : <span className="font-semibold not-italic">{settings.country}</span></span>
                      <span className="font-arabic">دولة</span>
                    </div>
                    {settings.vatNumber && (
                      <div className="flex justify-between border-b border-gray-50 pb-0.5">
                        <span className="font-bold flex gap-2">Vat No : <span className="font-semibold not-italic">{settings.vatNumber}</span></span>
                        <span className="font-arabic">رقم ضريبية</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* PO Reference (Right) */}
                <div className="text-[10px] space-y-1 pt-2 flex-1">
                  <div className="flex justify-between border-b pb-0.5">
                    <span className="font-bold">Order Number / رقم الطلب :</span>
                    <span className="font-mono">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between border-b pb-0.5">
                    <span className="font-bold">Order Date / تاريخ الطلب :</span>
                    <span>{order.createdAt ? format(order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-0.5">
                    <span className="font-bold">Due Date / تاريخ الاستحقاق :</span>
                    <span>{order.dueDate ? format(order.dueDate.toDate ? order.dueDate.toDate() : new Date(order.dueDate), "dd/MM/yyyy") : "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-0.5">
                    <span className="font-bold">Payment Method / طريقة الدفع :</span>
                    <span>{order.paymentMethod || "Cash"}</span>
                  </div>

                  {/* Customer Details */}
                  <div className="mt-4 border border-gray-200 p-3 rounded-sm">
                    <div className="flex justify-between border-b border-gray-800 mb-2 uppercase text-[10px] font-bold">
                      <span>Buyer :</span>
                      <span className="font-arabic">المشتري :</span>
                    </div>
                    <div className="space-y-1 leading-normal italic text-[10px]">
                      <div className="flex justify-between border-b border-gray-50 pb-0.5">
                        <span className="font-bold flex gap-2">Name : <span className="font-semibold not-italic">{order.customerName}</span></span>
                        <span className="font-arabic">الاسم</span>
                      </div>
                      {order.customerVat && (
                        <div className="flex justify-between border-b border-gray-50 pb-0.5">
                          <span className="font-bold flex gap-2">Vat No : <span className="font-semibold not-italic">{order.customerVat}</span></span>
                          <span className="font-arabic">الرقم الضريبي</span>
                        </div>
                      )}
                      {order.customerLocation && (
                        <div className="flex justify-between border-b border-gray-50 pb-0.5">
                          <span className="font-bold flex gap-2">Location : <span className="font-semibold not-italic">{order.customerLocation}</span></span>
                          <span className="font-arabic">الموقع</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-none">
              {/* Items Table */}
              <table className="w-full mb-8 text-sm border-collapse">
                <thead className="bg-gray-100 border-y border-gray-800">
                  <tr>
                    <th className="p-2 text-left w-12">S.No<br/>م</th>
                    <th className="p-2 text-left">Description<br/>البيان</th>
                    <th className="p-2 text-center w-16">Qty<br/>الكمية</th>
                    <th className="p-2 text-right w-24">Unit Price<br/>سعر الوحدة</th>
                    <th className="p-2 text-right w-20">VAT %<br/>الضريبة</th>
                    <th className="p-2 text-right w-20">VAT Amt<br/>مبلغ الضريبة</th>
                    <th className="p-2 text-right w-24">Total<br/>المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2 align-top">{idx + 1}</td>
                      <td className="p-2 align-top">
                        <div className="font-medium italic text-gray-900">{item.description}</div>
                        {item.descriptionAr && (
                          <div className="text-[11px] text-gray-600 font-arabic mt-1 leading-normal border-t border-gray-100 pt-0.5" dir="rtl">
                            {item.descriptionAr}
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-center align-top">{item.qty}</td>
                      <td className="p-2 text-right align-top">{item.unitPrice.toFixed(2)}</td>
                      <td className="p-2 text-right align-top">{item.vatRate}%</td>
                      <td className="p-2 text-right align-top">{item.vatAmount.toFixed(2)}</td>
                      <td className="p-2 text-right align-top">{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-between items-start gap-8">
                <div className="flex flex-col items-center gap-4">
                  {order.qrData && (
                    <div className="border p-1 bg-white">
                      <QRCodeSVG value={order.qrData} size={150} level="M" />
                    </div>
                  )}
                  <div className="text-[10px] text-gray-500 text-center uppercase tracking-wider">
                    Scannable Tax Invoice<br/>فاتورة ضريبية قابلة للتحقق
                  </div>
                </div>

                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Subtotal / المجموع الفرعي:</span>
                    <span>{order.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="font-semibold">Total VAT / مجموع الضريبة:</span>
                    <span>{order.totalVat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold bg-gray-100 p-2 border-2 border-gray-800">
                    <span>TOTAL / المجموع:</span>
                    <span>SAR {order.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-12 pt-8 border-t border-dashed border-gray-400 grid grid-cols-2 gap-8 text-center text-sm">
                <div>
                  <div className="h-16 border-b border-gray-300 mb-2"></div>
                  <p className="font-semibold">Cashier Signature</p>
                  <p className="font-arabic" dir="rtl">توقيع الكاشير</p>
                </div>
                <div>
                  <div className="h-16 flex items-center justify-center mb-2">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-400 border-double flex items-center justify-center opacity-20 text-gray-400 font-bold rotate-12">
                      <span className="text-center text-[10px]">COMPANY<br/>STAMP</span>
                    </div>
                  </div>
                  <p className="font-semibold">Company Stamp</p>
                  <p className="font-arabic" dir="rtl">ختم الشركة</p>
                </div>
              </div>

              <div className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                Thank you for your business! | شكرا لتعاملكم معنا
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
