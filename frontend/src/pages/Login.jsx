import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");              // email input value
    const [password, setPassword] = useState("");        // password input value
    const [error, setError] = useState("");              // error message shown on page
    const [loading, setLoading] = useState(false);       // disables button during request

    const { login } = useAuth();                         // login function from context
    const navigate = useNavigate();                      // for redirect after login

    // runs when form is submitted
    const handleLogin = async (e) => {
        e.preventDefault();                              // stop page reload

        setError("");                                    // clear old error
        setLoading(true);                                // show loading state

        try {
            await login(email, password);                // saves user in context
            navigate("/dashboard");                      // go to dashboard
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed"   // backend message or fallback
            );
        } finally {
            setLoading(false);                           // re-enable button
        }
    };

    return (
        <div className="authPage">
            <div className="authCard">

                {/* header with icon + title */}
                <div className="authHeader">
                    <div className="authIcon">
                        <Lock size={28} />               {/* lock icon */}
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Login to your Ledger account</p>
                </div>

                <form onSubmit={handleLogin} className="authForm">

                    {/* show error if any */}
                    {error && <p className="error">{error}</p>}

                    {/* email input */}
                    <div className="formGroup">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* password input */}
                    <div className="formGroup">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* submit button */}
                    <button
                        type="submit"
                        className="authButton"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* link to register */}
                <p className="authFooter">
                    Don't have an account?{" "}
                    <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;