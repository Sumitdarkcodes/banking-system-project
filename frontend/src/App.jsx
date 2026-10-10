import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";

function App() {
    return (
        <div>

            {/* navbar shows on every page */}
            <Navbar />

            <Routes>

                {/* public routes - no login needed */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* protected routes - login required */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transfer"
                    element={
                        <ProtectedRoute>
                            <Transfer />
                        </ProtectedRoute>
                    }
                />

                {/* 404 fallback - unknown URL */}
                <Route path="*" element={<h1>404 - Page not found</h1>} />

            </Routes>
        </div>
    );
}

export default App;