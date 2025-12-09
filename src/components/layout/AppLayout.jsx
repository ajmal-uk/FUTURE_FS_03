// App Layout - Main layout for authenticated users
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import "./AppLayout.css";

const AppLayout = () => {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="app-main">
                <Outlet />
            </main>
            <MobileNav />
        </div>
    );
};

export default AppLayout;
