import { useNavigate } from 'react-router';
import { DashboardLitePreview } from './DashboardLitePreview';

export function SeeItInAction() {
  const navigate = useNavigate();

  return (
    <section className="siia-section">
      <div className="siia-inner">
        {/* Header */}
        <div className="siia-header">
          <div className="siia-eyebrow">— ONE DASHBOARD · EVERY MOVE</div>
          <h2 className="siia-title">
            One dashboard. The whole{' '}
            <em className="siia-italic">picture.</em>
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
          background: #080A28;
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

        .siia-eyebrow {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(247,245,240,0.65);
          margin-bottom: 18px;
        }

        .siia-title {
          font-family: 'Manrope', 'Inter Tight', sans-serif;
          font-size: clamp(36px, 4.5vw, 56px);
          font-weight: 600;
          letter-spacing: -0.035em;
          line-height: 1.05;
          color: #F7F5F0;
          margin: 0 0 20px;
        }

        .siia-italic {
          font-family: 'Source Serif Pro', Georgia, serif;
          font-style: italic;
          font-weight: 400;
          color: #A5B4FC;
        }

        .siia-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 19px;
          color: rgba(247,245,240,0.65);
          line-height: 1.55;
          max-width: 560px;
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

        @media (max-width: 700px) {
          .siia-preview-wrap {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .siia-preview-wrap > * {
            min-width: 680px;
          }
        }
      `}</style>
    </section>
  );
}