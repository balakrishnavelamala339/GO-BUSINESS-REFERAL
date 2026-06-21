import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BASE_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals';

function ReferralDetail() {
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = Cookies.get('jwt_token');
        const res = await fetch(`${BASE_URL}?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        const d = json.data || json;
        if (d?.id && String(d.id) === String(id)) {
          setReferral(d);
        } else if (d?.referrals) {
          const found = d.referrals.find((r) => String(r.id) === String(id));
          found ? setReferral(found) : setNotFound(true);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  const formatDate = (dateStr) => dateStr?.replace(/-/g, '/') || '';
  const formatProfit = (profit) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(profit);

  return (
    <div className="detail-page">
      <Navbar />
      <main className="detail-main">
        {loading && <div className="loading">Loading...</div>}

        {!loading && notFound && (
          <div className="detail-card">
            <h1>Referral not found</h1>
            <br />
            <Link to="/" className="back-link">← Back to dashboard</Link>
          </div>
        )}

        {!loading && referral && (
          <div className="detail-card">
            <h1>Referral Details</h1>
            <h2>{referral.name}</h2>
            <ul className="detail-list">
              <li>
                <span className="dl-label">Referral ID</span>
                <span className="dl-value">{referral.id}</span>
              </li>
              <li>
                <span className="dl-label">Service Name</span>
                <span className="dl-value">{referral.serviceName}</span>
              </li>
              <li>
                <span className="dl-label">Date</span>
                <span className="dl-value">{formatDate(referral.date)}</span>
              </li>
              <li>
                <span className="dl-label">Profit</span>
                <span className="dl-value">{formatProfit(referral.profit)}</span>
              </li>
            </ul>
            <Link to="/" className="back-link">← Back to dashboard</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ReferralDetail;