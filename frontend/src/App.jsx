import { useState } from "react";
import "./App.css";

function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // ========================================
  // FIND NEXT ₹1 LAKH
  // ========================================

  const findRevenue = async () => {
    setAnalyzing(true);
    setShowResult(false);
    setRecoveryLink(null);

    try {
      const response = await fetch(
       "https://revenue-lzrlw3rcv-yash-codesync.vercel.app/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            goal: "Find my next ₹1 lakh",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setAnalysis(data);
      setAnalyzing(false);
      setShowResult(true);
    } catch (error) {
      console.error("Agent error:", error);

      setAnalyzing(false);

      alert(
        "Could not connect to RevenueOS backend. Make sure backend is running on port 5050."
      );
    }
  };

  // ========================================
  // EXECUTE RAZORPAY RECOVERY
  // ========================================

  const executeRecovery = async () => {
    setRecoveryLoading(true);
    setRecoveryLink(null);

    try {
      const response = await fetch(
        "https://revenue-lzrlw3rcv-yash-codesync.vercel.app/api/recovery-link",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 399900,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Recovery link creation failed"
        );
      }

      setRecoveryLink(data);
    } catch (error) {
      console.error("Recovery error:", error);

      alert(
        error.message ||
          "Could not create Razorpay recovery link"
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  // ========================================
  // CLOSE RESULT
  // ========================================

  const closeResult = () => {
    setShowResult(false);
    setRecoveryLink(null);
  };

  return (
    <div className="app">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside className="sidebar">

        <h1>RevenueOS</h1>

        <div className="merchant">
          <div className="avatar">U</div>

          <div>
            <strong>UrbanKart</strong>
            <span>D2C Fashion</span>
          </div>
        </div>

        <nav>
          <div className="nav-item active">
            ◉ Overview
          </div>

          <div className="nav-item">
            ↗ Revenue
          </div>

          <div className="nav-item">
            ◉ Customers
          </div>

          <div className="nav-item">
            ◈ Payments
          </div>

          <div className="nav-item">
            ⚡ AI Agent
          </div>
        </nav>

        <div className="ai-status">
          <div className="status-dot"></div>

          <div>
            <strong>AI Agent Online</strong>
            <span>Monitoring revenue</span>
          </div>
        </div>

      </aside>


      {/* ========================================
          AI ANALYZING OVERLAY
      ======================================== */}

      {analyzing && (
        <div className="ai-overlay">

          <div className="ai-modal">

            <div className="loader">
              ✦
            </div>

            <h2>
              RevenueOS is thinking...
            </h2>

            <p>
              Analyzing merchant data
            </p>

            <div className="analysis-steps">

              <div>✓ Payment patterns</div>

              <div>✓ Failed payments</div>

              <div>✓ Abandoned checkouts</div>

              <div>◌ Customer behavior</div>

            </div>

          </div>

        </div>
      )}


      {/* ========================================
          AI RESULT MODAL
      ======================================== */}

      {showResult && analysis && (
        <div className="ai-overlay">

          <div className="ai-modal result-modal">

            {/* HEADER */}

            <div className="success-icon">
              ✦
            </div>

            <p className="eyebrow">
              AI ANALYSIS COMPLETE
            </p>

            <h2>
              ₹
              {analysis.totalPotential?.toLocaleString(
                "en-IN"
              )}{" "}
              potential revenue found
            </h2>

            <p className="result-text">
              RevenueOS identified{" "}
              {analysis.opportunities?.length || 0}{" "}
              revenue opportunities across your
              payment funnel.
            </p>


            {/* ========================================
                OPPORTUNITIES
            ======================================== */}

            <div className="result-list">

              {analysis.opportunities?.map(
                (opportunity, index) => (

                  <div
                    className="result-item"
                    key={index}
                  >

                    <div>

                      <span>
                        {opportunity.type}
                      </span>

                      <small>
                        Confidence:{" "}
                        {opportunity.confidence}%
                      </small>

                    </div>

                    <strong>
                      ₹
                      {opportunity.potential?.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                )
              )}

            </div>


            {/* ========================================
                AGENT RECOMMENDATION
            ======================================== */}

            {analysis.recommendedAction && (
              <div className="recommended-action">

                <p className="eyebrow">
                  AGENT RECOMMENDATION
                </p>

                <strong>
                  {analysis.recommendedAction.type}
                </strong>

                <p>
                  {analysis.recommendedAction.reason}
                </p>

                <small>
                  Confidence:{" "}
                  {analysis.recommendedAction.confidence}%
                </small>

              </div>
            )}


            {/* ========================================
                ACTION BUTTONS
            ======================================== */}

            <div className="result-actions">

              <button
                className="secondary-button"
                onClick={closeResult}
              >
                Close
              </button>

              <button
                className="execute-button"
                onClick={executeRecovery}
                disabled={recoveryLoading}
              >
                {recoveryLoading
                  ? "Creating..."
                  : "Execute Recovery →"}
              </button>

            </div>


            {/* ========================================
                RAZORPAY SUCCESS
            ======================================== */}

            {recoveryLink && (
              <div className="recovery-success">

                <div className="recovery-icon">
                  ✓
                </div>

                <div className="recovery-info">

                  <strong>
                    Recovery Link Created
                  </strong>

                  <p>
                    Razorpay payment link generated
                    for ₹3,999
                  </p>

                  <small>
                    Payment ID:{" "}
                    {recoveryLink.paymentLinkId}
                  </small>

                </div>

                <a
                  href={recoveryLink.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="payment-link"
                >
                  Open Payment →
                </a>

              </div>
            )}

          </div>

        </div>
      )}


      {/* ========================================
          MAIN DASHBOARD
      ======================================== */}

      <main className="main">

        {/* HEADER */}

        <header>

          <div>

            <p className="eyebrow">
              AI GROWTH COMMAND CENTER
            </p>

            <h2>
              Good morning, UrbanKart 👋
            </h2>

            <p className="subtitle">
              Your AI agent is monitoring your
              payment funnel.
            </p>

          </div>

          <button
  className="ask-button"
  onClick={findRevenue}
  disabled={analyzing}
>
  {analyzing ? "Analyzing..." : "✦ Ask RevenueOS"}
</button>

        </header>


        {/* ========================================
            STATS
        ======================================== */}

        <section className="stats">

          <div className="stat-card">

            <span>
              Monthly Revenue
            </span>

            <strong>
              ₹42.6L
            </strong>

            <small className="positive">
              ↑ 8.4% vs last month
            </small>

          </div>


          <div className="stat-card">

            <span>
              Orders
            </span>

            <strong>
              3,842
            </strong>

            <small className="positive">
              ↑ 5.1%
            </small>

          </div>


          <div className="stat-card">

            <span>
              Payment Success
            </span>

            <strong>
              91.8%
            </strong>

            <small className="negative">
              ↓ 2.1%
            </small>

          </div>


          <div className="stat-card">

            <span>
              Potential Revenue
            </span>

            <strong>
              ₹1.56L
            </strong>

            <small className="ai-text">
              AI identified
            </small>

          </div>

        </section>


        {/* ========================================
            CONTENT GRID
        ======================================== */}

        <section className="content-grid">

          {/* ========================================
              REVENUE OPPORTUNITIES
          ======================================== */}

          <div className="opportunities card">

            <div className="section-header">

              <div>

                <p className="eyebrow">
                  AI DETECTED
                </p>

                <h3>
                  Revenue Opportunities
                </h3>

              </div>

              <span className="live">
                ● LIVE
              </span>

            </div>


            {/* FAILED PAYMENT */}

            <div className="opportunity danger">

              <div className="icon">
                !
              </div>

              <div className="opp-info">

                <strong>
                  Failed Payment Recovery
                </strong>

                <span>
                  315 failed payments detected
                </span>

              </div>

              <div className="amount">

                <strong>
                  ₹82,400
                </strong>

                <span>
                  potential
                </span>

              </div>

              <button
                onClick={findRevenue}
              >
                Review
              </button>

            </div>


            {/* ABANDONED CHECKOUT */}

            <div className="opportunity warning">

              <div className="icon">
                ↗
              </div>

              <div className="opp-info">

                <strong>
                  Abandoned Checkout
                </strong>

                <span>
                  317 customers left checkout
                </span>

              </div>

              <div className="amount">

                <strong>
                  ₹1.82L
                </strong>

                <span>
                  potential
                </span>

              </div>

              <button
                onClick={findRevenue}
              >
                Review
              </button>

            </div>


            {/* CUSTOMER WIN-BACK */}

            <div className="opportunity normal">

              <div className="icon">
                ★
              </div>

              <div className="opp-info">

                <strong>
                  Customer Win-back
                </strong>

                <span>
                  428 customers haven't returned
                </span>

              </div>

              <div className="amount">

                <strong>
                  ₹94,000
                </strong>

                <span>
                  potential
                </span>

              </div>

              <button
                onClick={findRevenue}
              >
                Review
              </button>

            </div>


            {/* MAIN AI BUTTON */}

            <button
              className="find-button"
              onClick={findRevenue}
              disabled={analyzing}
            >

              {analyzing
                ? "Analyzing..."
                : "✦ Find My Next ₹1 Lakh"}

            </button>

          </div>


          {/* ========================================
              AGENT ACTIVITY
          ======================================== */}

          <div className="agent card">

            <div className="section-header">

              <div>

                <p className="eyebrow">
                  AUTONOMOUS AGENT
                </p>

                <h3>
                  Agent Activity
                </h3>

              </div>

            </div>


            <div className="activity">

              <div className="activity-line">

                <span className="dot"></span>

                <div>

                  <strong>
                    Payment analysis completed
                  </strong>

                  <small>
                    2 minutes ago
                  </small>

                </div>

              </div>


              <div className="activity-line">

                <span className="dot"></span>

                <div>

                  <strong>
                    ₹1.56L opportunity detected
                  </strong>

                  <small>
                    5 minutes ago
                  </small>

                </div>

              </div>


              <div className="activity-line">

                <span className="dot"></span>

                <div>

                  <strong>
                    63 high-value customers identified
                  </strong>

                  <small>
                    8 minutes ago
                  </small>

                </div>

              </div>


              <div className="activity-line">

                <span className="dot"></span>

                <div>

                  <strong>
                    Monitoring checkout funnel
                  </strong>

                  <small>
                    Now
                  </small>

                </div>

              </div>

            </div>


            {/* AGENT GOAL */}

            <div className="agent-goal">

              <span>
                Current AI Goal
              </span>

              <strong>
                Increase merchant revenue
              </strong>

              <p>
                Find high-confidence opportunities
                and execute low-risk actions
                automatically.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;