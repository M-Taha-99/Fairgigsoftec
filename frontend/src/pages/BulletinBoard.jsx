import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Send, Trash2, ShieldAlert } from 'lucide-react';

export default function BulletinBoard() {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        const { data, error } = await supabase
            .from('bulletin_board')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error) setPosts(data);
        setLoading(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!newPost.trim()) return;

        const { error } = await supabase.from('bulletin_board').insert([{
            author_id: user.id,
            content: newPost
        }]);

        if (!error) {
            setNewPost('');
            fetchPosts();
        }
    }

    async function handleDelete(id) {
        const { error } = await supabase.from('bulletin_board').delete().eq('id', id);
        if (!error) fetchPosts();
    }

    return (
        <div className="animate-fade-in">
            <div className="dashboard-header">
                <div>
                    <h1 className="header-title">Community Bulletin Board</h1>
                    <p className="header-subtitle">Anonymous space for sharing updates, warnings, and support.</p>
                </div>
            </div>

            <div className="chart-box" style={{ marginBottom: '2rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                        type="text" 
                        className="auth-input" 
                        style={{ marginBottom: 0 }}
                        placeholder="Share something anonymously with the community..." 
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                    />
                    <button type="submit" className="btn-download" style={{ padding: '0.8rem 1.5rem' }}>
                        <Send size={18} /> Post
                    </button>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {posts.map((post) => (
                    <div key={post.id} className="stat-box" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                <MessageSquare size={16} /> Anonymous User
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {(user.role === 'advocate' || user.role === 'admin') && (
                                    <button 
                                        onClick={() => handleDelete(post.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        title="Moderate Post"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>{post.content}</p>
                    </div>
                ))}
            </div>

            {posts.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No posts yet. Be the first to start the conversation!</p>
                </div>
            )}
        </div>
    );
}
