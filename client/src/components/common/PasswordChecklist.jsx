import { PASSWORD_RULES } from '../../utils/validators.js';

/** Live checklist that ticks off each password rule as the user types. */
export default function PasswordChecklist({ password }) {
  return (
    <ul className="ss-pw-rules" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li key={rule.key} className={passed ? 'is-met' : ''}>
            <i className={`bi ${passed ? 'bi-check-circle-fill' : 'bi-circle'}`} aria-hidden="true" />
            {rule.label}
            <span className="visually-hidden">{passed ? ' (met)' : ' (not met yet)'}</span>
          </li>
        );
      })}
    </ul>
  );
}
