import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, Calendar, HelpCircle, BarChart2, PieChart, TrendingUp, Map, AlertCircle, MessageSquare, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    if (user?.role === 'verifier') {
        const fetchPending = async () => {
            const { count } = await supabase
                .from('earnings')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            setPendingCount(count || 0);
        };
        fetchPending();
    }
  }, [user]);

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="profile-section">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="profile-avatar" />
        <div className="profile-name">{user.email.split('@')[0]}</div>
        <div className="profile-role" style={{ textTransform: 'capitalize' }}>FairGig {user.role}</div>
      </div>

      <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>FAIRGIG</h2>
      </div>

      <nav>
        <NavLink to={`/${user.role}`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
          <Home size={18} /> Dashboard
        </NavLink>

        <div className="nav-section-title">Operations</div>
        {user.role === 'worker' ? (
            <>
                <NavLink to={`/worker/log`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <FileText size={18} /> Log Earnings
                </NavLink>
                <NavLink to={`/worker/grievances`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <AlertCircle size={18} /> Grievance Board
                </NavLink>
                <NavLink to={`/worker/bulletin`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <MessageSquare size={18} /> Community Bulletin
                </NavLink>
            </>
        ) : user.role === 'verifier' ? (
            <>
                <NavLink to={`/verifier/queue`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={18} /> Verification Queue
                    </div>
                    {pendingCount > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>{pendingCount}</span>}
                </NavLink>
                <NavLink to={`/verifier/bulletin`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <MessageSquare size={18} /> Community Bulletin
                </NavLink>
            </>
        ) : user.role === 'advocate' ? (
            <>
                <NavLink to={`/advocate/grievances`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <AlertCircle size={18} /> Manage Grievances
                </NavLink>
                <NavLink to={`/advocate/bulletin`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <MessageSquare size={18} /> Community Bulletin
                </NavLink>
            </>
        ) : (
            <>
                <NavLink to={`/admin`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <Shield size={18} /> Command Center
                </NavLink>
                <NavLink to={`/admin/bulletin`} className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                    <MessageSquare size={18} /> Community Bulletin
                </NavLink>
            </>
        )}
        
        <div className="nav-section-title">Account</div>
        <NavLink to={`/${user.role}/profile`} className="nav-link">
          <Users size={18} /> Profile
        </NavLink>
        <NavLink to={`/${user.role}/faq`} className="nav-link">
          <HelpCircle size={18} /> Support / FAQ
        </NavLink>
      </nav>
    </aside>
  );
}
