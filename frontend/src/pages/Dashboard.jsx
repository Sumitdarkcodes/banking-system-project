import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, Plus, ArrowRight, IndianRupee } from "lucide-react";
import api from "../services/api";

function Dashboard() {
    const [accounts, setAccounts] = useState([]);        // user's accounts from backend
    const [balances, setBalances] = useState({});        // balance per account id
    const [loading, setLoading] = useState(true);        // loading state
    const [error, setError] = useState("");              // error message
    const [creating, setCreating] = useState(false);     // true while creating account

    // runs once when page loads
    useEffect(() => {
        fetchAccounts();
    }, []);

    // fetch all accounts + their balances
    const fetchAccounts = async () => {
        try {
            setLoading(true);

            const response = await api.get("/accounts");         // get accounts
            const accountList = response.data.accounts || [];
            setAccounts(accountList);

            // fetch balance for each account
            const balanceMap = {};
            for (let i = 0; i < accountList.length; i++) {
                const account = accountList[i];
                try {
                    const balRes = await api.get(`/accounts/balance/${account._id}`);
                    balanceMap[account._id] = balRes.data.balance;
                } catch (err) {
                    balanceMap[account._id] = 0;                 // default if fails
                }
            }
            setBalances(balanceMap);

        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load accounts"   // fallback
            );
        } finally {
            setLoading(false);                                // done either way
        }
    };

    // runs when "Create Account" button is clicked
    const handleCreateAccount = async () => {
        setError("");                                         // clear old error
        setCreating(true);                                    // disable button

        try {
            await api.post("/accounts");                     // create account
            await fetchAccounts();                           // reload list
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to create account"   // fallback
            );
        } finally {
            setCreating(false);                              // re-enable button
        }
    };

    // show loading screen
    if (loading) {
        return (
            <div className="container">
                <p className="loading">Loading your accounts...</p>
            </div>
        );
    }

    return (
        <div className="container">

            {/* page header with create button */}
            <div className="dashboardHeader">
                <div>
                    <h1>My Accounts</h1>
                    <p>Manage your accounts and check balances</p>
                </div>

                <button
                    className="createAccountButton"
                    onClick={handleCreateAccount}
                    disabled={creating}
                >
                    <Plus size={18} />                       {/* plus icon */}
                    {creating ? "Creating..." : "New Account"}
                </button>
            </div>

            {/* show error if any */}
            {error && <p className="error">{error}</p>}

            {/* empty state - no accounts yet */}
            {accounts.length === 0 && (
                <div className="emptyState">
                    <div className="emptyStateIcon">🏦</div>  {/* bank emoji */}
                    <h3>No accounts yet</h3>
                    <p>Create your first account to start banking</p>
                </div>
            )}

            {/* accounts grid */}
            {accounts.length > 0 && (
                <div className="accountsGrid">

                    {accounts.map((account) => (
                        <div className="accountCard" key={account._id}>

                            {/* card header with icon + status */}
                            <div className="accountCardHeader">
                                <div className="accountIcon">
                                    <Wallet size={22} />     {/* wallet icon */}
                                </div>
                                <div>
                                    <h3>Account</h3>
                                    <span className="accountStatus">
                                        {account.status}
                                    </span>
                                </div>
                            </div>

                            {/* balance display */}
                            <p className="balanceLabel">Current Balance</p>
                            <p className="balanceAmount">
                                <IndianRupee size={20} />     {/* rupee symbol */}
                                {(balances[account._id] || 0).toLocaleString()}
                            </p>

                            {/* link to transfer page */}
                            <Link to="/transfer" className="transferLink">
                                Send Money
                                <ArrowRight size={16} />     {/* arrow icon */}
                            </Link>

                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}

export default Dashboard;