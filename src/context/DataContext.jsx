import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase-config';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [stock, setStock] = useState([]);
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Real-time Listeners
    useEffect(() => {
        const qStock = query(collection(db, "stock"), orderBy("arrival_date", "desc"));
        const qSales = query(collection(db, "sales"), orderBy("sale_date", "desc"));
        const qExpenses = query(collection(db, "expenses"), orderBy("expense_date", "desc"));

        const unsubStock = onSnapshot(qStock, (snapshot) => {
            const stockData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStock(stockData);
        });

        const unsubSales = onSnapshot(qSales, (snapshot) => {
            const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSales(salesData);
        });

        const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
            const expenseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenses(expenseData);
            setLoading(false);
        });

        return () => {
            unsubStock();
            unsubSales();
            unsubExpenses();
        };
    }, []);

    // Actions
    const addStock = async (item) => {
        try {
            const newItem = {
                ...item,
                packets_available: parseInt(item.total_packets_initial),
                total_stock_value: parseInt(item.total_packets_initial) * parseFloat(item.cost_per_packet),
                arrival_date: item.arrival_date || new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString()
            };
            await addDoc(collection(db, "stock"), newItem);
        } catch (error) {
            console.error("Error adding stock:", error);
            throw error;
        }
    };

    const addSale = async (sale) => {
        // Find the stock item to update inventory
        const stockItem = stock.find(s => s.id === sale.stock_batch_id);

        if (!stockItem) throw new Error("Stock batch not found");
        if (stockItem.packets_available < sale.packets_sold) throw new Error("Insufficient stock available");

        const total_amount_due = parseFloat(sale.total_amount_due);
        const amount_paid_now = parseFloat(sale.amount_paid_now);

        const newSale = {
            ...sale,
            sale_date: new Date().toISOString(),
            total_amount_due: total_amount_due,
            amount_paid: amount_paid_now,
            is_fully_paid: amount_paid_now >= total_amount_due,
            created_at: new Date().toISOString()
        };

        try {
            // 1. Add Sale Record
            await addDoc(collection(db, "sales"), newSale);

            // 2. Update Stock Quantity
            const stockRef = doc(db, "stock", sale.stock_batch_id);
            await updateDoc(stockRef, {
                packets_available: stockItem.packets_available - parseInt(sale.packets_sold)
            });
        } catch (error) {
            console.error("Error processing sale:", error);
            throw error;
        }
    };

    const addPayment = async (saleId, amount) => {
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;

        const newPaid = sale.amount_paid + parseFloat(amount);
        const isFullyPaid = newPaid >= sale.total_amount_due;

        try {
            const saleRef = doc(db, "sales", saleId);
            await updateDoc(saleRef, {
                amount_paid: newPaid,
                is_fully_paid: isFullyPaid
            });
        } catch (error) {
            console.error("Error adding payment:", error);
        }
    };

    const addExpense = async (expense) => {
        try {
            const newExpense = {
                ...expense,
                expense_date: new Date().toISOString(),
                created_at: new Date().toISOString()
            };
            await addDoc(collection(db, "expenses"), newExpense);
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    // Update Actions
    const updateStock = async (updatedItem) => {
        try {
            const itemRef = doc(db, "stock", updatedItem.id);
            // Destructure to separate id from data if necessary, though updateDoc handles it fine usually
            // but let's be safe and remove id from the update payload
            const { id, ...dataToUpdate } = updatedItem;
            await updateDoc(itemRef, dataToUpdate);
        } catch (error) {
            console.error("Error updating stock:", error);
        }
    };

    const updateSale = async (updatedItem) => {
        try {
            const itemRef = doc(db, "sales", updatedItem.id);
            const { id, ...dataToUpdate } = updatedItem;

            // Recalculate is_fully_paid if amounts changed
            if (dataToUpdate.amount_paid !== undefined && dataToUpdate.total_amount_due !== undefined) {
                dataToUpdate.is_fully_paid = dataToUpdate.amount_paid >= dataToUpdate.total_amount_due;
            }

            await updateDoc(itemRef, dataToUpdate);
        } catch (error) {
            console.error("Error updating sale:", error);
        }
    };

    const updateExpense = async (updatedItem) => {
        try {
            const itemRef = doc(db, "expenses", updatedItem.id);
            const { id, ...dataToUpdate } = updatedItem;
            await updateDoc(itemRef, dataToUpdate);
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };

    // Delete Actions
    const deleteStock = async (id) => {
        try {
            await deleteDoc(doc(db, "stock", id));
        } catch (error) {
            console.error("Error deleting stock:", error);
        }
    };

    const deleteSale = async (id) => {
        try {
            // Note: Deleting a sale DOES NOT automatically replenish stock in this simple version
            // You might want to add that logic if required
            await deleteDoc(doc(db, "sales", id));
        } catch (error) {
            console.error("Error deleting sale:", error);
        }
    };

    const deleteExpense = async (id) => {
        try {
            await deleteDoc(doc(db, "expenses", id));
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    // Dashboard Stats Logic
    const stats = {
        totalCollection: sales.reduce((acc, curr) => acc + (parseFloat(curr.amount_paid) || 0), 0),
        totalSalesValue: sales.reduce((acc, curr) => acc + (parseFloat(curr.total_amount_due) || 0), 0),
        stockPurchasedValue: stock.reduce((acc, curr) => acc + (parseFloat(curr.total_stock_value) || 0), 0),
        homeExpenses: expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0),
    };

    return (
        <DataContext.Provider value={{
            stock, sales, expenses,
            addStock, addSale, addPayment, addExpense,
            updateStock, updateSale, updateExpense,
            deleteStock, deleteSale, deleteExpense,
            stats,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};
