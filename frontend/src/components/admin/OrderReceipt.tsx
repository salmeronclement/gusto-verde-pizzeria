import React, { forwardRef } from 'react';
import { AdminOrder } from '../../services/api';

interface OrderReceiptProps {
    order: AdminOrder | null;
}

const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(({ order }, ref) => {
    if (!order) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <>
            {/* CRITICAL: Print-only styles */}
            <style>
                {`
                    /* Hide ticket on screen */
                    #thermal-receipt {
                        display: none !important;
                    }
                    
                    @media print {
                        /* Page setup for 80mm thermal */
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        
                        /* Hide EVERYTHING on the page */
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                        }
                        
                        body > * {
                            display: none !important;
                        }
                        
                        /* Show ONLY the receipt */
                        #thermal-receipt {
                            display: block !important;
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 80mm !important;
                            padding: 3mm !important;
                            margin: 0 !important;
                            background: white !important;
                            color: black !important;
                            font-family: 'Courier New', Courier, monospace !important;
                            font-size: 12px !important;
                            line-height: 1.4 !important;
                            z-index: 999999 !important;
                        }
                        
                        #thermal-receipt * {
                            visibility: visible !important;
                            color: black !important;
                        }
                    }
                `}
            </style>

            {/* The Receipt - Hidden on screen, shown on print */}
            <div id="thermal-receipt" ref={ref}>
                {/* ========== HEADER ========== */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px' }}>DOLCE PIZZA</div>
                    <div style={{ fontSize: '10px', marginTop: '2px' }}>Ticket Cuisine</div>
                </div>

                <div style={{ textAlign: 'center', borderTop: '1px dashed black', borderBottom: '1px dashed black', padding: '6px 0', marginBottom: '8px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>#{order.id}</div>
                    <div style={{ fontSize: '10px' }}>{formatDate(order.created_at)}</div>
                </div>

                {/* ========== MODE ========== */}
                <div style={{
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    padding: '8px',
                    border: '2px solid black',
                    marginBottom: '10px'
                }}>
                    {order.mode === 'livraison' ? 'LIVRAISON' : 'A EMPORTER'}
                </div>

                {/* ========== CLIENT ========== */}
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{order.customer.first_name} {order.customer.last_name}</div>
                    <div style={{ fontSize: '12px' }}>{order.customer.phone}</div>
                </div>

                <div style={{ borderBottom: '1px dashed black', marginBottom: '8px' }}></div>

                {/* ========== COMMENTAIRE GLOBAL ========== */}
                {order.comment && (
                    <div style={{
                        border: '2px solid black',
                        padding: '6px',
                        marginBottom: '10px',
                        fontWeight: 'bold',
                        fontSize: '11px'
                    }}>
                        NOTE: {order.comment}
                    </div>
                )}

                {/* ========== ARTICLES ========== */}
                <div style={{ marginBottom: '10px' }}>
                    {order.items && order.items.map((item, idx) => {
                        const rawPrice = (item as any).price ?? (item as any).unit_price ?? (item as any).unitPrice;
                        const price = rawPrice !== undefined ? Number(rawPrice) : 0;
                        const itemNotes = (item as any).notes;

                        return (
                            <div key={idx} style={{ marginBottom: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>
                                        <strong>{item.quantity}x</strong> {item.name || item.product_name}
                                    </span>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {price === 0 ? 'OFFERT' : `${price.toFixed(2)}E`}
                                    </span>
                                </div>
                                {itemNotes && (
                                    <div style={{
                                        paddingLeft: '15px',
                                        fontSize: '10px',
                                        fontStyle: 'italic'
                                    }}>
                                        &gt; {itemNotes}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ========== TOTAL ========== */}
                <div style={{ borderTop: '2px solid black', marginTop: '10px', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                        <span>TOTAL</span>
                        <span>{Number(order.total_amount).toFixed(2)} EUR</span>
                    </div>
                    {order.mode === 'livraison' && (order as any).delivery_fee > 0 && (
                        <div style={{ fontSize: '10px', textAlign: 'right' }}>
                            (dont livraison: {Number((order as any).delivery_fee).toFixed(2)}E)
                        </div>
                    )}
                </div>

                {/* ========== FOOTER ========== */}
                <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
                    <div>--------------------------------</div>
                    <div>Merci pour votre commande !</div>
                    <div>--------------------------------</div>
                </div>
            </div>
        </>
    );
});

OrderReceipt.displayName = 'OrderReceipt';

export default OrderReceipt;
