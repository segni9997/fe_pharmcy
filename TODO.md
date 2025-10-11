# TODO: Add Optional Fields to POS Management

## Tasks
- [x] Update Sale interface in src/lib/types.ts to include customer_address, vat_regno, fno

- [x] Add state variables for customerAddress, vatRegno, fno in src/components/pos-system.tsx
- [x] Add input fields for Address, VAT Reg No, F.No in the Customer Information card in POS
- [x] Update processSale function to include new fields in salePayload
- [x] Update invoice.tsx to display customer_address in toAddress, vat_regno in toVATReg, fno in fNo
- [ ] Test the changes by creating a sale and viewing the invoice
