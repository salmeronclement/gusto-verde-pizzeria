import React, { useState, useEffect } from 'react';
import { AdminOrder, updateOrderStatus, getAdminSettings } from '../../services/api';
import { X, Printer, CheckCircle, Clock } from 'lucide-react';

interface AdminOrderDetailsProps {
    order: AdminOrder;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (orderId: number, newStatus: string) => void;
}

const AdminOrderDetails: React.FC<AdminOrderDetailsProps> = ({ order, isOpen, onClose, onStatusChange }) => {
    const [autoPrint, setAutoPrint] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            getAdminSettings().then(data => {
                let shouldAutoPrint = false;
                if (data && data.auto_print_on_validate !== undefined) {
                    shouldAutoPrint = data.auto_print_on_validate === true || data.auto_print_on_validate === 'true';
                }
                setAutoPrint(shouldAutoPrint);
            }).catch(err => console.error("Failed to load settings", err));
        }
    }, [isOpen]);

    if (!isOpen || !order) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handlePrint = () => {
        // Create a new window with ONLY the ticket content
        const printWindow = window.open('', '_blank', 'width=350,height=600');
        if (!printWindow) {
            alert("Popup bloquée. Autorisez les popups pour imprimer.");
            return;
        }

        // Build items HTML
        const itemsHtml = order.items.map(item => {
            const rawPrice = (item as any).price ?? (item as any).unit_price ?? (item as any).unitPrice;
            const price = rawPrice !== undefined ? Number(rawPrice) : 0;
            const notes = (item as any).notes;
            return `
                <div style="margin-bottom: 6px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span><strong>${item.quantity}x</strong> ${item.name || item.product_name}</span>
                        <span style="font-weight: bold;">${price === 0 ? 'OFFERT' : price.toFixed(2) + 'E'}</span>
                    </div>
                    ${notes ? `<div style="padding-left: 15px; font-size: 10px; font-style: italic;">&gt; ${notes}</div>` : ''}
                </div>
            `;
        }).join('');

        const ticketHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket #${order.id}</title>
                <style>
                    @page { size: 80mm auto; margin: 0; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        width: 80mm;
                        padding: 3mm;
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        color: black;
                        background: white;
                    }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 8px;">
                    <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">DOLCE PIZZA</div>
                    <div style="font-size: 10px;">Ticket Cuisine</div>
                </div>
                
                <div style="text-align: center; border-top: 1px dashed black; border-bottom: 1px dashed black; padding: 6px 0; margin-bottom: 8px;">
                    <div style="font-size: 18px; font-weight: bold;">#${order.id}</div>
                    <div style="font-size: 10px;">${formatDate(order.created_at)}</div>
                </div>
                
                <div style="text-align: center; font-size: 18px; font-weight: bold; padding: 8px; border: 2px solid black; margin-bottom: 10px;">
                    ${order.mode === 'livraison' ? 'LIVRAISON' : 'A EMPORTER'}
                </div>
                
                <div style="margin-bottom: 8px;">
                    <div style="font-weight: bold; font-size: 14px;">${order.customer.first_name} ${order.customer.last_name}</div>
                    <div style="font-size: 12px;">${order.customer.phone}</div>
                </div>
                
                <div style="border-bottom: 1px dashed black; margin-bottom: 8px;"></div>
                
                ${order.comment ? `
                    <div style="border: 2px solid black; padding: 6px; margin-bottom: 10px; font-weight: bold; font-size: 11px;">
                        NOTE: ${order.comment}
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 10px;">
                    ${itemsHtml}
                </div>
                
                <div style="border-top: 2px solid black; margin-top: 10px; padding-top: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                        <span>TOTAL</span>
                        <span>${Number(order.total_amount).toFixed(2)} EUR</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 15px; font-size: 10px;">
                    <div>--------------------------------</div>
                    <div>Merci pour votre commande !</div>
                    <div>--------------------------------</div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(ticketHtml);
        printWindow.document.close();
    };

    const handleAccept = async () => {
        setProcessing(true);
        try {
            await updateOrderStatus(order.id, 'en_preparation');
            onStatusChange(order.id, 'en_preparation');

            if (autoPrint) {
                handlePrint();
            }
            onClose();
        } catch (error) {
            alert("Erreur lors de la validation");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xl font-bold text-gray-800">#{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.mode === 'livraison' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.mode}
                        </span>
                        <span className="text-gray-500 text-sm">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                            title="Imprimer le ticket"
                        >
                            <Printer size={20} />
                        </button>
                    </div>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Client</h3>
                            <p className="font-bold text-lg">{order.customer.first_name} {order.customer.last_name}</p>
                            <p className="text-gray-600 font-mono">{order.customer.phone}</p>
                        </div>
                        {order.mode === 'livraison' && order.delivery && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Livraison</h3>
                                <p className="text-gray-800">
                                    {(order as any).address?.street || "Adresse non chargée"} <br />
                                    {(order as any).address?.postal_code} {(order as any).address?.city}
                                </p>
                            </div>
                        )}
                    </div>

                    {order.comment && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <h3 className="text-xs font-bold text-yellow-800 uppercase mb-1">💬 Commentaire Global</h3>
                            <p className="text-gray-800 italic text-lg">"{order.comment}"</p>
                        </div>
                    )}

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-2">Détails Commande</h3>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => {
                                const rawPrice = (item as any).price ?? (item as any).unit_price ?? (item as any).unitPrice;
                                const price = rawPrice !== undefined ? Number(rawPrice) : 0;
                                return (
                                    <div key={idx} className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <span className="font-bold text-lg w-8 text-center bg-gray-100 rounded">{item.quantity}x</span>
                                            <div>
                                                <p className="font-medium text-lg text-gray-900">{item.name || item.product_name}</p>
                                                {(item as any).notes && (
                                                    <p className="text-sm text-gray-500 italic mt-1 bg-gray-50 px-2 py-1 rounded inline-block">
                                                        ✏️ {(item as any).notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-700">
                                            {price === 0 ? 'OFFERT' : `${price.toFixed(2)} €`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{Number(order.total_amount).toFixed(2)} €</p>
                            <p className="text-xs text-gray-500">Total TTC</p>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                        <X size={20} /> Fermer
                    </button>

                    {order.status === 'en_attente' ? (
                        <button
                            onClick={handleAccept}
                            disabled={processing}
                            className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            {processing ? <Clock className="animate-spin" /> : <CheckCircle size={24} />}
                            ACCEPTER / CUISINER
                        </button>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 font-bold bg-gray-200 rounded-lg">
                            Statut: {order.status.replace('_', ' ')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
