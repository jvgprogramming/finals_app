// @ts-nocheck
import { useState } from 'react';
import {
  UserIcon,
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { formatPeso } from '../../utils/currency';

export default function AdminDetailModal({
  order,
  onClose,
  onAccept,
  onDecline,
  onProgress,
}) {
  const [remarks, setRemarks] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee = order.deliveryFee ?? (order.type === 'delivery' ? 50 : 0);

  const handleApprove = () => {
    onAccept(order.id, remarks);
    onClose();
  };

  const handleDeclineSubmit = (e) => {
    e.preventDefault();
    onDecline(order.id, remarks);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px' }}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <XMarkIcon className="h-5 w-5" aria-hidden />
        </button>

        <div className="checkout-modal-inner">
          <h3
            className="modal-title"
            style={{
              borderBottom: '1.5px solid var(--almond)',
              paddingBottom: '12px',
              marginBottom: '24px',
            }}
          >
            Reviewing Order Reference: {order.order_number || order.id}
          </h3>

          <div className="checkout-grid">
            <div>
              <h4 className="checkout-section-title">Customer Logistics</h4>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  marginBottom: '20px',
                }}
              >
                <UserIcon style={{ width: 14, height: 14 }} aria-hidden />{' '}
                <strong>Name:</strong> {order.customerName}
                <br />
                <PhoneIcon style={{ width: 14, height: 14 }} aria-hidden />{' '}
                <strong>Phone:</strong> {order.customerPhone}
                <br />
                <CalendarDaysIcon style={{ width: 14, height: 14 }} aria-hidden />{' '}
                <strong>Requested Date:</strong> {order.date}
                <br />
                <ClockIcon style={{ width: 14, height: 14 }} aria-hidden />{' '}
                <strong>Requested Time:</strong> {order.time}
                <br />
                <MapPinIcon style={{ width: 14, height: 14 }} aria-hidden />{' '}
                <strong>Fulfillment:</strong>{' '}
                {order.type === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                <br />
                {order.type === 'delivery' && order.address && (
                  <>
                    <strong>Address:</strong> {order.address}
                    <br />
                  </>
                )}
                <strong>Payment:</strong> {order.paymentMethod}
              </p>

              <h4 className="checkout-section-title">Order Breakdown</h4>
              <ul style={{ listStyle: 'none', marginBottom: '20px' }}>
                {order.items.map((item, idx) => (
                  <li
                    key={item.id ?? idx}
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      fontSize: '13.5px',
                    }}
                  >
                    <strong>{item.quantity}x</strong> {item.name} — ₱
                    {(item.price * item.quantity).toLocaleString()}
                  </li>
                ))}
              </ul>

              {!isDeclining ? (
                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label className="form-label">
                    Internal Prep Notes / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Extra gold leaf, morning rush delivery"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              ) : (
                <form
                  onSubmit={handleDeclineSubmit}
                  className="remarks-input-wrapper"
                >
                  <label
                    className="form-label"
                    style={{ color: 'var(--danger)' }}
                  >
                    Specify Rejection Reason (Required) *
                  </label>
                  <textarea
                    className="dedication-textarea"
                    required
                    placeholder="Reason for declining this order"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  <div
                    style={{ display: 'flex', gap: '8px', marginTop: '12px' }}
                  >
                    <button
                      type="button"
                      className="btn-primary"
                      style={{
                        background: 'none',
                        border: '1px solid var(--almond)',
                        color: 'var(--cocoa)',
                        boxShadow: 'none',
                      }}
                      onClick={() => setIsDeclining(false)}
                    >
                      Go Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ backgroundColor: 'var(--danger)' }}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )}

              {order.statusKey === 'pending' && !isDeclining && (
                <div
                  style={{ display: 'flex', gap: '16px', marginTop: '32px' }}
                >
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      backgroundColor: 'var(--danger)',
                      boxShadow: 'none',
                    }}
                    onClick={() => setIsDeclining(true)}
                  >
                    Decline Order
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ backgroundColor: 'var(--success)' }}
                    onClick={handleApprove}
                  >
                    Accept & Approve Order
                  </button>
                </div>
              )}

              {order.statusKey !== 'pending' &&
                order.statusKey !== 'declined' &&
                order.statusKey !== 'completed' && (
                  <div
                    style={{
                      marginTop: '24px',
                      backgroundColor: 'var(--alabaster)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--almond)',
                    }}
                  >
                    <span className="option-label">Bakery Prep Actions:</span>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginTop: '8px',
                      }}
                    >
                      {order.statusKey === 'accepted' && (
                        <button
                          type="button"
                          className="btn-sm btn-accept"
                          onClick={() => {
                            onProgress(order.id, 'preparing');
                            onClose();
                          }}
                        >
                          Begin Preparing / Baking
                        </button>
                      )}
                      {order.statusKey === 'preparing' && (
                        <button
                          type="button"
                          className="btn-sm btn-review"
                          onClick={() => {
                            onProgress(order.id, 'ready');
                            onClose();
                          }}
                        >
                          Mark Ready for Dispatch
                        </button>
                      )}
                      {order.statusKey === 'ready' && (
                        <button
                          type="button"
                          className="btn-sm btn-accept"
                          onClick={() => {
                            onProgress(order.id, 'completed');
                            onClose();
                          }}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div>
              <div className="order-summary-box">
                <h4
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--almond)',
                    paddingBottom: '8px',
                  }}
                >
                  Payment Summary
                </h4>
                <div style={{ fontSize: '13px', lineHeight: 1.8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Items subtotal</span>
                    <span>{formatPeso(itemsSubtotal)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Delivery fee</span>
                      <span>{formatPeso(deliveryFee)}</span>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '800',
                    fontSize: '15px',
                  }}
                >
                  <span>Total Due:</span>
                  <span>{formatPeso(order.totalPrice)}</span>
                </div>
                <p style={{ marginTop: '12px', fontSize: '13px' }}>
                  <ChartBarIcon style={{ width: 14, height: 14 }} aria-hidden />{' '}
                  Status: {order.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
