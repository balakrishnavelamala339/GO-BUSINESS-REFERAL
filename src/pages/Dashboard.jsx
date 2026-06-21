import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BASE_URL = "https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals";
const PAGE_SIZE = 10;

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('desc');
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const fetchReferrals= useCallback(async (searchVal, sortVal) => {
        setLoading(true);
        setError('');
        try {
            const token = Cookies.get('jwt_token');    
            let  url= BASE_URL;
            const params = new URLSearchParams();
            if (searchVal) params.set('search', searchVal);
            if (sortVal) params.set('sort', sortVal);
            if ([...params].length) url += '?' + params.toString();
            const res=await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
          
            if(!res.ok){
                setError(`json?.message || 'Failed to load data'} ($res.status)`);
                setLoading(false);
                return;
            }
            setData(json.data || json);
            setPage(1);
        }   catch (err) {
            setError(err.message || 'An error occurred while fetching data');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
    fetchReferrals('', 'desc');
  }, [fetchReferrals]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchReferrals(val, sort);
  };

  const handleSort = (e) => {
    const val = e.target.value;
    setSort(val);
    fetchReferrals(search, val);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateStr) => dateStr?.replace(/-/g, '/') || '';

  const formatProfit = (profit) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(profit);

  const referrals = data?.referrals || [];
  const totalPages = Math.ceil(referrals.length / PAGE_SIZE);
  const from = referrals.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, referrals.length);
  const pageRows = referrals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Referral Dashboard</h1>
          <p>Track your referrals, earnings, and partner activity in one place.</p>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && (
          <div className="error-alert" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Overview */}
            <section role="region" aria-label="Overview metrics">
              <h2 className="section-title">Overview</h2>
              <div className="overview-grid">
                {(data.metrics || []).map((m) => (
                  <div className="metric-card" key={m.id}>
                    <div className="label">{m.label}</div>
                    <div className="value">{m.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Service Summary */}
            <section className="service-summary" aria-label="Service summary">
              <h2 className="section-title">Service summary</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="s-label">Service</div>
                  <div className="s-value">{data.serviceSummary?.service}</div>
                </div>
                <div className="summary-item">
                  <div className="s-label">Your Referrals</div>
                  <div className="s-value">{data.serviceSummary?.yourReferrals}</div>
                </div>
                <div className="summary-item">
                  <div className="s-label">Active Referrals</div>
                  <div className="s-value">{data.serviceSummary?.activeReferrals}</div>
                </div>
                <div className="summary-item">
                  <div className="s-label">Total Ref. Earnings</div>
                  <div className="s-value">{data.serviceSummary?.totalRefEarnings}</div>
                </div>
              </div>
            </section>

            {/* Share Referral */}
            <section className="share-referral" aria-label="Share referral">
              <h2>Refer friends and earn more</h2>
              <div className="referral-field">
                <label>Your Referral Link</label>
                <div className="referral-field-row">
                  <input type="text" readOnly value={data.referral?.link || ''} />
                  <button className="copy-btn" onClick={() => handleCopy(data.referral?.link)}>
                    Copy
                  </button>
                </div>
              </div>
              <div className="referral-field">
                <label>Your Referral Code</label>
                <div className="referral-field-row">
                  <input type="text" readOnly value={data.referral?.code || ''} />
                  <button className="copy-btn" onClick={() => handleCopy(data.referral?.code)}>
                    Copy
                  </button>
                </div>
              </div>
            </section>

            {/* All Referrals Table */}
            <section className="referrals-section">
              <h2 className="section-title">All referrals</h2>
              <div className="table-controls">
                <input
                  className="search-input"
                  type="text"
                  placeholder="Name or service…"
                  value={search}
                  onChange={handleSearch}
                  aria-label="Search referrals"
                />
                <label className="sort-label">
                  Sort by date
                  <select value={sort} onChange={handleSort}>
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </label>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        No matching entries
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row) => (
                      <tr key={row.id} onClick={() => navigate(`/referral/${row.id}`)}>
                        <td>{row.name}</td>
                        <td>{row.serviceName}</td>
                        <td>{formatDate(row.date)}</td>
                        <td>{formatProfit(row.profit)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {referrals.length > 0 && (
                <div className="pagination">
                  <span className="pagination-info">
                    Showing {from}–{to} of {referrals.length} entries
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`page-btn ${p === page ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="page-btn"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages || totalPages === 0}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
