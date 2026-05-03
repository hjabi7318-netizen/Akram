/**
 * ZATCA (Zakat, Tax and Customs Authority) Saudi Arabia
 * QR Code TLV (Tag-Length-Value) Generation
 */

export function generateZatcaTLV(
  sellerName: string,
  vatNumber: string,
  timestamp: string,
  totalWithVat: string,
  vatTotal: string
): string {
  const tlvParts = [
    { tag: 1, value: sellerName },
    { tag: 2, value: vatNumber },
    { tag: 3, value: timestamp },
    { tag: 4, value: totalWithVat },
    { tag: 5, value: vatTotal },
  ];

  const buffers: Uint8Array[] = tlvParts.map((item) => {
    const encoder = new TextEncoder();
    const valueBuffer = encoder.encode(item.value);
    const tagBuffer = new Uint8Array([item.tag]);
    const lengthBuffer = new Uint8Array([valueBuffer.length]);
    
    const combined = new Uint8Array(tagBuffer.length + lengthBuffer.length + valueBuffer.length);
    combined.set(tagBuffer, 0);
    combined.set(lengthBuffer, tagBuffer.length);
    combined.set(valueBuffer, tagBuffer.length + lengthBuffer.length);
    
    return combined;
  });

  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  const finalBuffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    finalBuffer.set(b, offset);
    offset += b.length;
  }

  // Convert binary to base64
  return btoa(String.fromCharCode(...finalBuffer));
}
