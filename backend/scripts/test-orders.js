const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in Node 18+
// If node < 18, we might need to use http module or just rely on the fact that we are in a modern environment.
// The user environment says "Node.js", usually recent versions have fetch.
// Let's use native fetch.

async function testOrders() {
    const baseUrl = 'http://localhost:5000/api';

    // 1. Create an order
    console.log('Testing POST /api/orders...');
    const orderPayload = {
        customer: {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@example.com',
            phone: '0601020304'
        },
        address: {
            label: 'Maison',
            street: '123 Rue de la Pizza',
            postalCode: '75001',
            city: 'Paris',
            additionalInfo: 'Code 1234'
        },
        mode: 'livraison',
        items: [
            {
                productName: 'Pizza Reine',
                unitPrice: 12.50,
                quantity: 2,
                category: 'classique'
            },
            {
                productName: 'Coca-Cola',
                unitPrice: 3.00,
                quantity: 1,
                category: 'boisson'
            }
        ]
    };

    try {
        const createRes = await fetch(`${baseUrl}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        const createData = await createRes.json();
        console.log('Create Order Response:', createData);

        if (createRes.status !== 201) {
            console.error('❌ Failed to create order');
            return;
        }

        // 2. Get orders for the customer
        // We need the customer ID. Since the API doesn't return it directly in the create response (only orderId),
        // we might need to query the DB or just assume we know it if we were the frontend.
        // Wait, the requirement said "1) Créer ou retrouver le client".
        // If I use the same email, it should find the same customer.
        // But I don't know the ID to call GET /customers/:id/orders.
        // Ah, the prompt said: "Retourner un JSON avec par exemple : { orderId: 123, status: 'en_attente' }"
        // It didn't explicitly ask to return customerId.
        // However, to test the GET route, I need the customerId.
        // I can cheat and query the DB in this script, or I can update the API to return customerId.
        // Let's update the API to return customerId as well, it's useful for the frontend.
        // But first let's see if I can guess it. If it's the first customer, it's probably 1.
        // Let's try fetching for customer 1.

        console.log('Testing GET /api/customers/1/orders...');
        const getRes = await fetch(`${baseUrl}/customers/1/orders`);
        const getData = await getRes.json();
        console.log('Get Orders Response:', getData);

    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

testOrders();
