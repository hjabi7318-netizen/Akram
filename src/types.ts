export interface InvoiceItem {
  id: string;
  description: string;
  descriptionAr?: string;
  qty: number;
  unitPrice: number;
  vatRate: number; // usually 15
  vatAmount: number;
  total: number;
}

export interface Order {
  id?: string;
  orderNumber: string;
  createdAt: any; // Firestore Timestamp
  customerName: string;
  customerVat?: string;
  customerLocation?: string;
  items: InvoiceItem[];
  subTotal: number;
  totalVat: number;
  grandTotal: number;
  cashier: string;
  status: 'draft' | 'paid' | 'cancelled';
  dueDate?: any; // Firestore Timestamp
  paymentMethod?: string;
  qrData?: string;
}

export interface Settings {
  name: string;
  nameAr: string;
  building: string;
  buildingAr: string;
  street: string;
  streetAr: string;
  district: string;
  districtAr: string;
  city: string;
  cityAr: string;
  country: string;
  countryAr: string;
  postalCode: string;
  additionalNo: string;
  vatNumber: string;
  crn: string;
  otherId: string;
  phone: string;
  location: string;
  locationAr: string;
}

export const COMPANY_DETAILS = {
  name: "QR GRAND MART",
  nameAr: "كيو آر جراند مارت",
  building: "",
  buildingAr: "مبنى",
  street: "Dammam Seiko",
  streetAr: "شارع",
  district: "",
  districtAr: "منطقة",
  city: "Dammam",
  cityAr: "مدينة",
  country: "Saudi Arabia",
  countryAr: "دولة",
  postalCode: "",
  additionalNo: "",
  vatNumber: "310122334400003",
  crn: "",
  otherId: "",
  phone: "+966 13 123 4567",
  location: "Dammam Seiko, Saudi Arabia",
  locationAr: "العنوان العربي",
};
