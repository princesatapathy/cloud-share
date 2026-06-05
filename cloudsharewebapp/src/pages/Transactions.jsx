import DashboardLayout from "../layout/DashboardLayout.jsx";
import {useEffect, useState} from "react";
import {useAuth} from "@clerk/react";
import axios from "axios";
import {apiEndpoints} from "../util/apiEndpoints.js";
import {AlertCircle, Loader2, Receipt} from "lucide-react";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {getToken} = useAuth();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const token = await getToken();
                const response = await axios.get(
                    apiEndpoints.TRANSACTIONS,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setTransactions(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setError(
                    "Failed to load your transaction history. Please try again later."
                );
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [getToken]);

    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Format amount from paise to rupees
    const formatAmount = (amountInPaise) => {
        return `₹${(amountInPaise / 100).toFixed(2)}`;
    };

    return (
        <DashboardLayout activeMenu="Transactions">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Receipt className="text-terracotta" />
                    <h1 className="text-3xl font-semibold text-espresso">Transactions</h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64 text-muted">
                        <Loader2 className="animate-spin mr-2 text-terracotta" size={24} />
                        <span>Loading transactions...</span>
                    </div>
                ): transactions.length === 0 ? (
                    <div className="bg-surface border border-warmborder p-8 rounded-2xl text-center">
                        <Receipt size={48} className="mx-auto mb-4 text-terracotta/40" />
                        <h3 className="text-lg font-medium text-espresso mb-2">
                            No Transactions Yet
                        </h3>
                        <p className="text-muted">
                            You haven't made any credit purchases yet. Visit the Subscription
                            page to buy credits.
                        </p>
                    </div>
                ): (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-surface border border-warmborder rounded-2xl overflow-hidden shadow-sm">
                            <thead className="bg-cream">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                        Credits Added
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                        Payment ID
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-warmborder">
                            {transactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-cream transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                                        {formatDate(transaction.transactionDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                                        {transaction.planId === "premium"
                                            ? "Premium Plan"
                                            : transaction.planId === "ultimate"
                                                ? "Ultimate Plan"
                                                : "Basic Plan"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                                        {formatAmount(transaction.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                                        {transaction.creditsAdded}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted font-mono">
                                        {transaction.paymentId
                                            ? transaction.paymentId.substring(0, 12) + "..."
                                            : "N/A"}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default Transactions;
