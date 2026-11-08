import { ORDER_FLOW, STATUS_META, TIMELINE_LABELS } from '../../utils/orderStatus.js';
import { formatDateTime } from '../../utils/formatters.js';
import './StatusTimeline.css';

/** Step-by-step order tracker built from the order's status history. */
export default function StatusTimeline({ order }) {
  const cancelled = order.status === 'cancelled';
  const steps = cancelled ? ['pending', 'cancelled'] : ORDER_FLOW;
  const currentIndex = steps.indexOf(order.status);
  const timeOf = (step) => order.history.find((entry) => entry.status === step)?.at;

  return (
    <ol className="ss-timeline" aria-label="Order progress">
      {steps.map((step, index) => {
        // Once an order is delivered every step is complete.
        const state = index < currentIndex || order.status === 'delivered' ? 'done' : index === currentIndex ? 'current' : 'todo';
        const time = timeOf(step);

        return (
          <li key={step} className={`ss-timeline__step is-${state} ${step === 'cancelled' ? 'is-cancelled' : ''}`}>
            <span className="ss-timeline__dot">
              <i className={`bi ${state === 'done' ? 'bi-check-lg' : STATUS_META[step].icon}`} aria-hidden="true" />
            </span>
            <div className="ss-timeline__text">
              <strong>{TIMELINE_LABELS[step]}</strong>
              <small>{time ? formatDateTime(time) : 'Waiting'}</small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
