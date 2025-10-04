import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGetSaleByIdQuery } from "@/store/saleApi";
import { useAuth } from "@/lib/auth";
import "../assets/css/invoice.css";

export default function InvoicePage() {
  const { user } = useAuth();

  const [date, setDate] = useState("");
  const [fNo, setFNo] = useState("");
  const [fromAddress, setFromAddress] = useState(user?.username || "");
  const [fromTIN, setFromTIN] = useState("0024397833");
  const [toAddress, setToAddress] = useState("");
  const [toHouseNo, setToHouseNo] = useState("");
  const [toVATReg, setToVATReg] = useState("");

  const [items, setItems] = useState(
    Array(10)
      .fill(null)
      .map((_, index) => ({
        id: index + 1,
        description: "",
        unit: "",
        qty: "",
        unitPrice: "",
        totalPrice: "",
      }))
  );

  const [subTotal, setSubTotal] = useState("");
  const [vat, setVat] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [checkNo, setCheckNo] = useState("");
  const [_, setPreparedBy] = useState("");
  const [cashierSign, setCashierSign] = useState("");

  const location = useLocation();

  const saleIdFromState = location.state?.saleId;
  const { data: saleDetail } = useGetSaleByIdQuery(saleIdFromState || "", { skip: !saleIdFromState });

  useEffect(() => {
    const sale = location.state?.sale;
    if (sale) {
      setDate(new Date(sale.sale_date).toLocaleDateString());
      setFNo(sale.id);
      setToAddress(sale.customer_name || "");
      setToHouseNo(sale.customer_phone || "");

      const saleItems = sale.items.map((item: any, index: number) => ({
        id: index + 1,
        description: item.medicine_name,
        unit: "",
        qty: item.quantity.toString(),
        unitPrice: item.price.toString(),
        totalPrice: item.total_price.toString(),
      }));

      setItems(saleItems);

      // Calculate totals based on sale
      const subTotalValue = parseFloat(sale.base_price);
      const discountAmount = parseFloat(sale.discounted_amount);
      const totalAfterDiscount = subTotalValue - discountAmount;
      setSubTotal(totalAfterDiscount.toFixed(2));
      setVat("0.00"); // No VAT in POS
      setGrandTotal(totalAfterDiscount.toFixed(2));

      setPreparedBy(sale.discounted_by || "");
    }
  }, [location.state]);

  useEffect(() => {
    if (saleDetail) {
      setDate(new Date(saleDetail.sale_date).toLocaleDateString());
      setFNo(saleDetail.id);
      setToAddress(saleDetail.customer_name || "");
      setToHouseNo(saleDetail.customer_phone || "");

      const saleItems = saleDetail.items.map((item: any, index: number) => ({
        id: index + 1,
        description: item.medicine_name,
        unit: "",
        qty: item.quantity.toString(),
        unitPrice: item.price.toString(),
        totalPrice: item.total_price.toString(),
      }));

      setItems(saleItems);

      // Calculate totals based on sale
      const subTotalValue = parseFloat(saleDetail.base_price);
      const discountAmount = parseFloat(saleDetail.discounted_amount);
      const totalAfterDiscount = subTotalValue - discountAmount;
      setSubTotal(totalAfterDiscount.toFixed(2));
      setVat("0.00"); // No VAT in POS
      setGrandTotal(totalAfterDiscount.toFixed(2));

      setPreparedBy(saleDetail.discounted_by || "");
    }
  }, [saleDetail]);

  type ItemField = "description" | "unit" | "qty" | "unitPrice" | "totalPrice";

  const handleItemChange = (index: number, field: ItemField, value: string) => {
    const newItems = [...items];
    // Type assertion to avoid 'never' type error
    (newItems[index] as any)[field] = value;

    // Auto-calculate total price
    if (field === "qty" || field === "unitPrice") {
      const qty =
        Number.parseFloat(field === "qty" ? value : newItems[index].qty) || 0;
      const unitPrice =
        Number.parseFloat(
          field === "unitPrice" ? value : newItems[index].unitPrice
        ) || 0;
      newItems[index].totalPrice = (qty * unitPrice).toFixed(2);
    }

    setItems(newItems);
    calculateTotals(newItems);
  };

  const calculateTotals = (currentItems: any[]) => {
    const sum = currentItems.reduce((acc, item) => {
      return acc + (Number.parseFloat(item.totalPrice) || 0);
    }, 0);

    setSubTotal(sum.toFixed(2));
    const vatAmount = sum * 0.15; // 15% VAT
    setVat(vatAmount.toFixed(2));
    setGrandTotal((sum + vatAmount).toFixed(2));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all fields?")) {
      setDate("");
      setFNo("");
      setToAddress("");
      setToHouseNo("");
      setToVATReg("");
      setItems(
        Array(10)
          .fill(null)
          .map((_, index) => ({
            id: index + 1,
            description: "",
            unit: "",
            qty: "",
            unitPrice: "",
            totalPrice: "",
          }))
      );
      setSubTotal("");
      setVat("");
      setGrandTotal("");
      setCheckNo("");
      setPreparedBy("");
      setCashierSign("");
    }
  };

  return (
    <div className="invoice-page">
      <div className="invoice-container">
        <div className="invoice-header">
          <div className="pharmacy-name-amharic">ቶሂም መድኃኒት ቤት</div>
          <div className="pharmacy-name-english">TO HIM PHARMACY</div>
          <div className="header-fields flex flex-row justify-between">
            <div className="field-group">
              <label>Date:</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>F.No:</label>
              <input
                type="text"
                value={fNo}
                onChange={(e) => setFNo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="parties-section">
          <div className="party">
            <h3>From:</h3>
            <div className="party-field">
              <label>Seller:</label>
              <input
                type="text"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
              />
            </div>
            <div className="party-field">
              <label>Address:</label>
              <span>S/C</span>
            </div>
            <div className="party-field">
              <label>TIN No:</label>
              <input
                type="text"
                value={fromTIN}
                onChange={(e) => setFromTIN(e.target.value)}
              />
            </div>
          </div>

          <div className="party">
            <h3>To:</h3>
            <div className="party-field">
              <label>Customer:</label>
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
            </div>
            <div className="party-field">
              <label>Phone:</label>
              <input
                type="text"
                value={toHouseNo}
                onChange={(e) => setToHouseNo(e.target.value)}
              />
            </div>
            <div className="party-field">
              <label>VAT Reg.No:</label>
              <input
                type="text"
                value={toVATReg}
                onChange={(e) => setToVATReg(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="invoice-title">Attachment Cash Sales Invoice</div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}>S.No</th>
              <th style={{ width: "300px" }}>Description</th>
              <th style={{ width: "80px" }}>Unit</th>
              <th style={{ width: "80px" }}>Qty.</th>
              <th style={{ width: "100px" }}>Unit Price</th>
              <th style={{ width: "120px" }}>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <input
                    type="text"
                    className="description-input"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) =>
                      handleItemChange(index, "unit", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(index, "qty", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input type="text" value={item.totalPrice} readOnly />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals-section">
          <table className="totals-table">
            <tbody>
              <tr>
                <td className="label-cell">Sub-Total</td>
                <td className="value-cell">
                  <input type="text" value={subTotal} readOnly />
                </td>
              </tr>
              <tr>
                <td className="label-cell">VAT</td>
                <td className="value-cell">
                  <input type="text" value={vat} readOnly />
                </td>
              </tr>
              <tr>
                <td className="label-cell">Grand Total</td>
                <td className="value-cell">
                  <input type="text" value={grandTotal} readOnly />
                </td>
              </tr>
            </tbody>
          </table>
        </div>



        <div className="payment-section">
          <div className="payment-field">
            <label>Mode of Payment:</label>
            <label>Cash</label>
            <input
              type="checkbox"
              checked={paymentMode === "cash"}
              onChange={(e) => setPaymentMode(e.target.checked ? "cash" : "")}
            />
            <label>Check No.</label>
            <input
              type="text"
              value={checkNo}
              onChange={(e) => setCheckNo(e.target.value)}
            />
          </div>
          <div className="payment-field">
            <label>Cashier Sign:</label>
            <input
              type="text"
              value={cashierSign}
              onChange={(e) => setCashierSign(e.target.value)}
            />
          </div>
        </div>

        <div className="footer-note">
          INVALID WITHOUT FISCAL OR RECEIPT ATTACHED
        </div>

        <div className="action-buttons">
          <button className="btn btn-print" onClick={handlePrint}>
            🖨️ Print Invoice
          </button>
          <button className="btn btn-clear" onClick={handleClear}>
            🗑️ Clear Form
          </button>
        </div>
        <div className="phone-number">
          <span>☎</span>
          <span>0995-969797</span>
        </div>
      </div>
    </div>
  );
}
