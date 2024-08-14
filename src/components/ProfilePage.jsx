import React, { useState } from 'react';

const ProfilePage = ({ user,onExpiryDateUpdate }) => {
    const [subscriptionExpired, setSubscriptionExpired] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(null);

     // Handle subscription extension
     const extendSubscription = async () => {
        if (!user) return;

        console.log('Extending subscription...');
        let newExpiryDate;

        const currentDate = new Date();

        if (selectedDuration === '30 days') {
            newExpiryDate = new Date(currentDate.setDate(currentDate.getDate() + 30));
        } else if (selectedDuration === '6 months') {
            newExpiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 6));
        } else if (selectedDuration === '1 year') {
            newExpiryDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
        } else {
            alert('Please select a valid duration.');
            return;
        }

        // Format the new expiry date
        const formattedExpiryDate = newExpiryDate.toISOString()

        // Update expiry date via parent callback
        if (onExpiryDateUpdate) {
            await onExpiryDateUpdate(formattedExpiryDate);
        }

        // Update local state
        setSubscriptionExpired(false); // Assume successful update, adjust as needed
    }

 

    return (
        <div>
            <h1>My Profile and Settings</h1>
            {user ? (
                <div>
                    <img
                        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                        src={user.image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9dB5ERe0v9QUXux7rr6TnHW9nNlvmZpWqqA&s'}
                        alt="User"
                    />
                    <p><strong>id:</strong> {user.id}</p>

                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Subscription Status:</strong> {subscriptionExpired ? 'Expired' : 'Active'}</p>
                   
                    <div>
                    {subscriptionExpired && (
<>
<select onChange={(e) => setSelectedDuration(e.target.value)} value={selectedDuration}>
                            <option value="">Select duration</option>
                            <option value="30 days">30 days</option>
                            <option value="6 months">6 months</option>
                            <option value="1 year">1 year</option>
                        </select>
                        <button onClick={extendSubscription}>
                            Extend Subscription
                        </button></>
)}
                        <button>Delete my account</button>
                    </div>
                </div>
            ) : (
                <p>Please log in to see your profile details.</p>
            )}
        </div>
    );
};

export default ProfilePage;
