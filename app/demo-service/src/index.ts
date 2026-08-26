import "./instrumentation";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
	res.json({ message: "Demo service" });
});

app.get("/products", (_req, res) => {
	res.json([
        { id: 1, name: "Laptop", price: 85000 },
		{ id: 2, name: "Keyboard", price: 30000 },
        { id: 3, name: "Mouse", price: 15000 },
        { id: 4, name: "Mac Studio", price: 170000 },
    ]);
});

app.get("/orders", (_req, res) => {
	res.json([
        { id: 1, customerId: 1, productId: 1, quantity: 2 },
		{ id: 2, customerId: 2, productId: 2, quantity: 1 },
        { id: 3, customerId: 1, productId: 3, quantity: 3 },
        { id: 4, customerId: 3, productId: 4, quantity: 1 },
    ]);
});

app.post("/payments", (req, res) => {
	res.status(201).json({ message: "Payment created", payment: req.body });
});

app.listen(port, () => {
	console.log(`Demo service listening on port ${port}`);
});
