import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApplication } from '../api';
import StepIndicator from '../components/StepIndicator';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedId, setSubmittedId] = useState(null);
  const [formData, setFormData] = useState({
    customerType: 'individual',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    taxReference: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const steps = ['Customer Type', 'Personal Info', 'Address', 'Review & Submit'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
      setError(null);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        customerType: formData.customerType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        taxReference: formData.taxReference,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
      };

      const response = await createApplication(payload);
      setSubmittedId(response.id || response.applicationId);
      setStep(steps.length + 1);
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = () => {
    navigate('/customers');
  };

  return (
    <main className="main-content">
      <div className="top-bar">
        <h1 className="page-title">Application Onboarding</h1>
      </div>

      <div className="page-content" style={{ maxWidth: '650px', margin: '0 auto' }}>
        {submittedId ? (
          <div className="card">
            <div className="text-center">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 className="card-title">Application Submitted Successfully</h2>
              <p style={{ color: '#666', marginBottom: '16px' }}>
                Your application has been submitted and is now pending review.
              </p>
              <div className="info-row">
                <span className="info-label">Application ID:</span>
                <span className="info-value">{submittedId}</span>
              </div>
              <div className="btn-group" style={{ marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={handleViewCustomer}>
                  View Customers
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <StepIndicator steps={steps} currentStep={step} />

            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
              {/* Step 1: Customer Type */}
              {step === 1 && (
                <div>
                  <h2 className="card-title">Customer Type</h2>
                  <div className="form-group">
                    <label>Select Customer Type</label>
                    <select
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleInputChange}
                    >
                      <option value="individual">Individual</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px', marginTop: '12px' }}>
                    {formData.customerType === 'individual'
                      ? 'Individual customers are natural persons. They will need to provide personal identification and tax information.'
                      : 'Business customers are legal entities. They will need to provide company information and business tax details.'}
                  </p>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <div>
                  <h2 className="card-title">Personal Information</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tax Reference (SSN/EIN) *</label>
                    <input
                      type="text"
                      name="taxReference"
                      value={formData.taxReference}
                      onChange={handleInputChange}
                      placeholder="12-3456789"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {step === 3 && (
                <div>
                  <h2 className="card-title">Address Information</h2>
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="San Francisco"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="CA"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="94102"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="United States"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div>
                  <h2 className="card-title">Review Information</h2>
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ color: '#1a1a2e', marginBottom: '12px' }}>
                      Personal Information
                    </h4>
                    <div className="info-row">
                      <span className="info-label">Customer Type</span>
                      <span className="info-value">
                        {formData.customerType.charAt(0).toUpperCase() +
                          formData.customerType.slice(1)}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Name</span>
                      <span className="info-value">
                        {formData.firstName} {formData.lastName}
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email</span>
                      <span className="info-value">{formData.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{formData.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date of Birth</span>
                      <span className="info-value">{formData.dateOfBirth}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Tax Reference</span>
                      <span className="info-value">{formData.taxReference}</span>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ color: '#1a1a2e', marginBottom: '12px' }}>
                      Address
                    </h4>
                    <div className="info-row">
                      <span className="info-label">Street</span>
                      <span className="info-value">{formData.street}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">City</span>
                      <span className="info-value">{formData.city}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">State</span>
                      <span className="info-value">{formData.state}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">ZIP Code</span>
                      <span className="info-value">{formData.zip}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Country</span>
                      <span className="info-value">{formData.country}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="btn-group" style={{ marginTop: '32px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handlePrev}
                  disabled={step === 1}
                  style={{ opacity: step === 1 ? 0.5 : 1 }}
                >
                  ← Previous
                </button>
                {step < steps.length ? (
                  <button className="btn btn-primary" onClick={handleNext}>
                    Next →
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : '✓ Submit Application'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
