import React, { useContext } from 'react';
import { Search, Bell, Settings, LogOut, Download } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Topbar() {
    const { logout } = useContext(AuthContext);

    return (
        <div className="topbar">
            <div className="search-box">
                <Search size={16} color="var(--text-primary)" />
                <input type="text" placeholder="Search" />
            </div>
            
            <div className="topbar-icons">
                <button className="btn-download" onClick={() => alert('Downloading reports...')}>
                    <Download size={16} /> Download Reports
                </button>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
                    <Bell size={20} />
                    <Settings size={20} />
                    <LogOut size={20} onClick={logout} />
                </div>
            </div>
        </div>
    );
}
