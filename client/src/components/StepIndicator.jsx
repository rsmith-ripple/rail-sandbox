export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step}>
          <div
            className={`step ${
              index + 1 <= currentStep ? 'completed' : ''
            } ${index + 1 === currentStep ? 'active' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step}</div>
          </div>
          {index < steps.length - 1 && <div className="step-connector"></div>}
        </div>
      ))}
    </div>
  );
}
