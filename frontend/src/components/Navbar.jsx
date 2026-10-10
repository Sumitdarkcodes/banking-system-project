import { Link, useNavigate } from "react-router-dom";
import { Wallet, LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();                  // user + logout from context
    const navigate = useNavigate();                      // for redirect after logout

    // runs when logout button is clicked
    const handleLogout = async () => {
        try {
            await logout();                              // clear cookie + user
            navigate("/login");                          // go to login page
        } catch (err) {
            console.log("Logout error:", err.message);   // rare failure
        }
    };

    return (
        <nav className="navbar">
            <div className="navbarContainer">

                {/* logo on the left */}
                <Link to="/" className="navbarLogo">
                    <Wallet size={24} />                     {/* wallet icon */}
                    <span>Ledger System</span>
                </Link>

                {/* links on the right */}
                <div className="navbarLinks">

                    {/* show only when NOT logged in */}
                    {!user && (
                        <>
                            <Link to="/login" className="navbarLink">
                                <LogIn size={18} />          {/* login icon */}
                                <span>Login</span>
                            </Link>

                            <Link to="/register" className="navbarLink primary">
                                <UserPlus size={18} />       {/* register icon */}
                                <span>Register</span>
                            </Link>
                        </>
                    )}

                    {/* show only when logged in */}
                    {user && (
                        <>
                            <span className="navbarUser">
                                Hi, {user.name}
                            </span>

                            <button
                                className="navbarLogoutButton"
                                onClick={handleLogout}
                            >
                                <LogOut size={18} />         {/* logout icon */}
                                <span>Logout</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;