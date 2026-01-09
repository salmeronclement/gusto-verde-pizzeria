async function testUpdate() {
    try {
        const payload = {
            delivery_fees: "3.50",
            min_order: "20.00",
            schedule: [
                { day: 'Lundi', open: '18:00', close: '22:30', closed: false }
            ]
        };

        console.log("Sending update request...");
        const response = await fetch('http://localhost:5000/api/admin/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error Status:", response.status);
            console.error("Error Data:", data);
        } else {
            console.log("Success:", data);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testUpdate();
