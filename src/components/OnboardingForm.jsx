import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Lock } from 'lucide-react';

const OnboardingForm = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isStripeLoading, setIsStripeLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        // Personal Info
        email: '',
        firstName: '',
        lastName: '',
        position: '',
        workNumber: '',
        cellNumber: '',
        
        // Business Details
        firmName: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        postalCode: '',
        
        // Assistant Info
        assistantName: '',
        assistantPhoneNumber: ''
    });

    const validateForm = () => {
        const requiredFields = {
            firstName: 'First Name',
            lastName: 'Last Name',
            position: 'Position',
            workNumber: 'Work Phone',
            cellNumber: 'Cell Phone',
            firmName: 'Firm Name',
            address1: 'Address Line 1',
            city: 'City',
            state: 'State',
            postalCode: 'Postal Code'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key]) => !formData[key])
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            alert(`Please fill in the following required fields:\n${missingFields.join('\n')}`);
            return false;
        }

        // Phone number validation
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
        if (!phoneRegex.test(formData.workNumber)) {
            alert('Please enter a valid work phone number in the format (XXX) XXX-XXXX');
            return false;
        }
        if (!phoneRegex.test(formData.cellNumber)) {
            alert('Please enter a valid cell phone number in the format (XXX) XXX-XXXX');
            return false;
        }

        return true;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Phone number formatting
        if (name === 'workNumber' || name === 'cellNumber' || name === 'assistantPhoneNumber') {
            // Remove all non-digits
            const digits = value.replace(/\D/g, '');
            
            // Format as (XXX) XXX-XXXX
            if (digits.length <= 10) {
                let formattedValue = digits;
                if (digits.length >= 3) {
                    formattedValue = `(${digits.slice(0, 3)})${digits.length > 3 ? ' ' : ''}${digits.slice(3)}`;
                }
                if (digits.length >= 6) {
                    formattedValue = `${formattedValue.slice(0, 9)}-${formattedValue.slice(9)}`;
                }
                setFormData(prev => ({
                    ...prev,
                    [name]: formattedValue
                }));
            }
            return;
        }
    
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const renderInputField = (label, name, placeholder, required = true, type = "text") => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
    );

    const renderAutoFilledField = (label, value) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
                />
                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <p className="mt-1 text-xs text-gray-500">Auto-filled from your registration</p>
        </div>
    );

    const renderStepContent = (step) => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-gray-600 mb-6">Please verify your contact information</p>
                        
                        {renderAutoFilledField('Email', formData.email || 'user@example.com')}
                        {renderInputField('First Name', 'firstName', 'Your first name')}
                        {renderInputField('Last Name', 'lastName', 'Your last name')}
                        {renderInputField('Position', 'position', 'Your role')}
                        {renderInputField('Work Phone', 'workNumber', '(XXX) XXX-XXXX', true, 'tel')}
                        {renderInputField('Cell Phone', 'cellNumber', '(XXX) XXX-XXXX', true, 'tel')}
                    </div>
                );
            
            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Business Details</h3>
                        <p className="text-gray-600 mb-6">Enter your business information</p>
                        
                        {renderInputField('Firm Name', 'firmName', 'Your company name')}
                        {renderInputField('Address Line 1', 'address1', 'Street address')}
                        {renderInputField('Address Line 2', 'address2', 'Suite, unit, etc.', false)}
                        
                        <div className="grid grid-cols-2 gap-4">
                            {renderInputField('City', 'city', 'City')}
                            {renderInputField('State', 'state', 'State')}
                        </div>
                        {renderInputField('Postal Code', 'postalCode', 'ZIP code')}
                    </div>
                );
            
            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Connect Your Bank Account</h3>
                        <p className="text-gray-600 mb-6">Set up payments with Stripe Connect</p>
                        
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-blue-900">
                                To receive payments, you'll need to connect your bank account through Stripe.
                                Your banking information is secured with industry-leading encryption.
                            </p>
                        </div>
                        
                        <button 
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={isStripeLoading}
                            onClick={async () => {
                                setIsStripeLoading(true);
                                try {
                                    const response = await fetch('https://smart-onboarding.herokuapp.com/api/create-connect-account', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            email: formData.email,
                                            name: `${formData.firstName} ${formData.lastName}`,
                                            company: formData.firmName
                                        }),
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        throw new Error(errorData.error || 'Failed to connect with Stripe');
                                    }

                                    const data = await response.json();
                                    
                                    if (data.accountLink) {
                                        window.location.href = data.accountLink;
                                    } else {
                                        throw new Error('No account link received from server');
                                    }
                                } catch (error) {
                                    console.error('Error connecting to Stripe:', error);
                                    alert('Error connecting to Stripe: ' + error.message);
                                } finally {
                                    setIsStripeLoading(false);
                                }
                            }}
                        >
                            {isStripeLoading ? 'Connecting...' : 'Connect with Stripe'}
                        </button>
                    </div>
                );
            
            case 4:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Assistant Information</h3>
                        <p className="text-gray-600 mb-6">Optional: Add your assistant's contact details</p>
                        
                        {renderInputField('Assistant Name', 'assistantName', 'Full name', false)}
                        {renderInputField('Assistant Phone', 'assistantPhoneNumber', '(XXX) XXX-XXXX', false, 'tel')}
                    </div>
                );
            
            case 5:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Review & Confirm</h3>
                        <p className="text-gray-600 mb-6">Please review your information</p>
                        
                        <div className="space-y-3">
                            {Object.entries(formData).map(([key, value]) => (
                                value && (
                                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="text-gray-900 font-medium">{value}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    const totalSteps = 5;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="flex items-center">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center
                                ${step < currentStep ? 'bg-blue-600 text-white' :
                                  step === currentStep ? 'border-2 border-blue-600 text-blue-600' :
                                  'border-2 border-gray-300 text-gray-300'}
                            `}>
                                {step < currentStep ? <Check className="h-5 w-5" /> : step}
                            </div>
                            {step < totalSteps && (
                                <div className={`w-full h-1 mx-2 ${
                                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                {renderStepContent(currentStep)}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        disabled={currentStep === 1}
                        className={`flex items-center px-4 py-2 rounded ${
                            currentStep === 1 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-blue-600 hover:bg-blue-50'
                        }`}
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Previous
                    </button>
                    
                    {currentStep < totalSteps ? (
                        <button
                            onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Continue
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </button>
                    ) : (
                        <button
                            disabled={isSubmitting}
                            onClick={async () => {
                                if (!validateForm()) return;
                                setIsSubmitting(true);
                                try {
                                    const response = await fetch('/caspio/v2/tables/A_SqSpace_Users_SMART/records', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
'Authorization': 'Bearer KSDar5TEnzC_UjeNFqD0s4pu9-754RxR_bTUKVJQ5d-k-SD6gDu9Bm_7E6drY7fKUyqcOdHnlWw6ukkagjWRw5sLNrid9U4aRrFopuNTUoqjK2sX28eQkqqg1SHnZQEhw20b0zwFl3oN-yfLv29q8yxIxOEXx8iMA5aQBgPu0cT193PwSHJJblAl-SQBZH58nC5aY3HpYL82oEkMmLsioI0jzFyLMx9afeKA848OqK0OWCYDwo3X1BiWfAirACCb8OQSXgwMzTsNtmfKNPSZgdx8pieLsBL4m2XYgUoU3y4lZkIcGG__IyP1jJShVpKHRzo1oxpnkDs-ZGOPo9et8TozzCAnQszC5cFKkYZy9Gqi4Ab83YuYoQ1xDZh_geVdpcCTHvbLDzsEKrfjbYaf9dNKbCKfX9e--mfGBF10lA8'
                                        },
                                        body: JSON.stringify({
                                            "email": formData.email,
                                            "firstName": formData.firstName,
                                            "lastName": formData.lastName,
                                            "position": formData.position,
                                            "workNumber": formData.workNumber,
                                            "cellNumber": formData.cellNumber,
                                            "firmName": formData.firmName,
                                            "address1": formData.address1,
                                            "address2": formData.address2,
                                            "city": formData.city,
                                            "state": formData.state,
                                            "postalCode": formData.postalCode,
                                            "stripeAccountId": formData.stripeAccountId || "",
                                            "stripeStatus": formData.stripeStatus || "",
                                            "assistantName": formData.assistantName,
                                            "assistantPhoneNumber": formData.assistantPhoneNumber
                                        })
                                    });

                                    if (!response.ok) {
                                        const errorData = await response.json();
                                        throw new Error(errorData.message || 'Form submission failed');
                                    }

                                    // Handle successful submission
                                    alert('Form submitted successfully!');
                                    // Optional: Redirect or show success message
                                    // window.location.href = '/success';

                                } catch (error) {
                                    console.error('Error submitting form:', error);
                                    alert('Error submitting form. Please try again.');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingForm;