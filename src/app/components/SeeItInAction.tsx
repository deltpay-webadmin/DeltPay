import { useNavigate } from 'react-router';
import { DashboardLitePreview } from './DashboardLitePreview';

export function SeeItInAction() {
  const navigate = useNavigate();

  return (
    <section className="siia-section">
      <div className="siia-inner">
        {/* Header */}
        <div className="siia-header">
          <h2 className="siia-title">
            One dashboard. The whole picture<span style={{ color: '#4945FF' }}>.</span>
          </h2>
          <p className="siia-subtitle">
            Explore our platform to see how Delt helps you run, grow, and fund your business — all from one dashboard.
          </p>
        </div>

        {/* Lite Dashboard Preview */}
        <div className="siia-preview-wrap">
          <DashboardLitePreview onClickOverride={() => navigate('/demo')} />
        </div>
      </div>

      <style>{`
        .siia-section {
          background: #041E42;
          padding: 100px 60px 120px;
          position: relative;
        }

        .siia-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .siia-header {
          text-align: center;
          margin-bottom: 56px;
        }

        .siia-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(36px, 4.5vw, 56px);
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.08;
          color: #FFFFFF;
          margin: 0 0 20px;
        }

        .siia-subtitle {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 19px;
          color: rgba(255,255,255,0.55);
          line-height: 1.65;
          max-width: 520px;
          margin: 0 auto;
        }

        .siia-preview-wrap {
          perspective: 1200px;
        }

        @media (max-width: 900px) {
          .siia-section {
            padding: 60px 20px 80px;
          }
          .siia-header { margin-bottom: 36px; }
          .siia-subtitle { font-size: 16px; }
        }
      `}</style>
    </section>
  );
}