import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import api from "../services/api";

function Register() {
    const [name, setName] = useState("");                // name input value
    const [email, setEmail] = useState("");              // email input value
    const [password, setPassword] = useState("");        // password input value
    const [error, setError] = useState("");              // error message shown on page
    const [loading, setLoading] = useState(false);       // disables button during request

    const navigate = useNavigate();                      // for redirect after register

    // runs when form is submitted
    const handleRegister = async (e) => {
        e.preventDefault();                              // stop page reload

        setError("");                                    // clear old error
        setLoading(true);                                // show loading state

        try {
            await api.post("/auth/register", { name, email, password });
            navigate("/login");                          // go to login after register
        } catch (err) {
            setError(
                err.response?.data?.message || "Registration failed"   // backend message or fallback
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
                        <UserPlus size={28} />           {/* user-plus icon */}
                    </div>
                    <h1>Create Account</h1>
                    <p>Join Ledger System today</p>
                </div>

                <form onSubmit={handleRegister} className="authForm">

                    {/* show error if any */}
                    {error && <p className="error">{error}</p>}

                    {/* name input */}
                    <div className="formGroup">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

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
                            placeholder="Create a password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            required
                        />
                    </div>

                    {/* submit button */}
                    <button
                        type="submit"
                        className="authButton"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>

                {/* link to login */}
                <p className="authFooter">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;