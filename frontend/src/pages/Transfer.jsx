import { useState, useEffect } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import api from "../services/api";

function Transfer() {
    const [accounts, setAccounts] = useState([]);        // user's accounts
    const [fromAccount, setFromAccount] = useState("");  // selected from account
    const [toAccount, setToAccount] = useState("");      // receiver account id
    const [amount, setAmount] = useState("");            // transfer amount
    const [idempotencyKey, setIdempotencyKey] = useState(""); // unique key for the transfer
    const [error, setError] = useState("");              // error message
    const [success, setSuccess] = useState("");          // success message
    const [loading, setLoading] = useState(false);       // disables button during request

    // generates unique key using timestamp + random
    const generateKey = () => {
        return "tx-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
    };

    // runs once when page loads
    useEffect(() => {
        fetchAccounts();
        setIdempotencyKey(generateKey());                // create one key on mount
    }, []);                                              // empty deps = runs once

    // fetch accounts to fill the dropdown
    const fetchAccounts = async () => {
        try {
            const response = await api.get("/accounts");                // get user accounts
            const list = response.data.accounts || [];                  // fallback to empty
            setAccounts(list);

            if (list.length > 0) {                                      // if accounts exist
                setFromAccount(list[0]._id);                            // auto-select first one
            }
        } catch (err) {
            console.log("Error loading accounts:", err.message);        // log and continue
        }
    };

    // runs when form is submitted
    const handleTransfer = async (e) => {
        e.preventDefault();                              // stop page reload

        setError("");                                    // clear old messages
        setSuccess("");

        if (!fromAccount || !toAccount || !amount) {     // check all fields filled
            setError("Please fill all fields");
            return;
        }

        if (Number(amount) <= 0) {                       // amount must be positive
            setError("Amount must be greater than 0");
            return;
        }

        setLoading(true);                                // disable button

        try {
            await api.post("/transactions", {
                fromAccount: fromAccount,
                toAccount: toAccount,
                amount: Number(amount),
                idempotencyKey: idempotencyKey           // reuse same key for retries
            });

            setSuccess("Transaction completed successfully!");

            setToAccount("");                            // clear form for next transfer
            setAmount("");
            setIdempotencyKey(generateKey());            // new key after success

        } catch (err) {
            setError(
                err.response?.data?.message || "Transaction failed"     // backend message
            );
        } finally {
            setLoading(false);                           // re-enable button
        }
    };

    return (
        <div className="container">
            <div className="transferPage">

                {/* page header */}
                <div className="transferHeader">
                    <h1>Send Money</h1>
                    <p>Transfer funds between accounts instantly</p>
                </div>

                <div className="transferCard">
                    <form onSubmit={handleTransfer} className="transferForm">

                        {/* error message box */}
                        {error && (
                            <p className="error">
                                <AlertCircle size={16} /> {error}   {/* warning icon */}
                            </p>
                        )}

                        {/* success message box */}
                        {success && (
                            <p className="success">
                                <CheckCircle size={16} /> {success}  {/* check icon */}
                            </p>
                        )}

                        {/* from account dropdown */}
                        <div className="transferFormGroup">
                            <label>From Account</label>
                            <select
                                value={fromAccount}
                                onChange={(e) => setFromAccount(e.target.value)}
                                required
                            >
                                <option value="">Select your account</option>

                                {accounts.map((acc) => (
                                    <option key={acc._id} value={acc._id}>
                                        {acc._id.slice(-8)} - {acc.currency}   {/* short id */}
                                    </option>
                                ))}
                            </select>
                            <small>Your account (money will leave from here)</small>
                        </div>

                        {/* to account input */}
                        <div className="transferFormGroup">
                            <label>To Account ID</label>
                            <input
                                type="text"
                                placeholder="Paste receiver's account ID"
                                value={toAccount}
                                onChange={(e) => setToAccount(e.target.value)}
                                required
                            />
                            <small>Receiver's account ID (money will arrive here)</small>
                        </div>

                        {/* amount input */}
                        <div className="transferFormGroup">
                            <label>Amount</label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                                required
                            />
                        </div>

                        {/* submit button */}
                        <button
                            type="submit"
                            className="transferButton"
                            disabled={loading}
                        >
                            <Send size={18} />               {/* send icon */}
                            {loading ? "Processing..." : "Send Money"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Transfer;