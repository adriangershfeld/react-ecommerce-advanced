import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { updateUserData, deleteUserAccount } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/main.css';

const Profile: React.FC = () => {
  const { user, userData } = useAuthContext(); // Access auth context
  const navigate = useNavigate();

  // Local state for form fields
  const [displayName, setDisplayName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // State for messages and control flags
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Populate form fields when userData is loaded
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || '');
      setAddress(userData.address || '');
      setPhoneNumber(userData.phoneNumber || '');
    }
  }, [userData]);

  // Handle form submission to update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    // Reset messages and start loading state
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // Only update editable fields; preserve admin status
      await updateUserData(user.uid, {
        displayName,
        address,
        phoneNumber,
        isAdmin: userData.isAdmin, // don't allow editing admin flag
      });
      setMessage('Profile updated successfully');
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle user account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      await deleteUserAccount(user.uid); // Remove user account
      navigate('/'); // Redirect to home
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  // Loading fallback if user data hasn't been fetched yet
  if (!user || !userData) {
    return <div className="loading-container">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      {/* Feedback messages */}
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {/* Profile update form */}
      <form onSubmit={handleUpdateProfile}>
        {/* Email (non-editable) */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={userData.email}
            disabled
          />
          <p className="form-hint">Email cannot be changed</p>
        </div>

        {/* Display name */}
        <div className="form-group">
          <label htmlFor="displayName">Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
        </div>

        {/* Phone number */}
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {/* Account deletion section */}
      <div className="danger-zone">
        <h3>Danger Zone</h3>
        
        {/* Delete confirmation flow */}
        {!deleteConfirm ? (
          <button 
            className="delete-account-btn"
            onClick={() => setDeleteConfirm(true)}
          >
            Delete Account
          </button>
        ) : (
          <div className="delete-confirm">
            <p>Are you sure? This action cannot be undone.</p>
            <button 
              className="delete-confirm-btn" 
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              Yes, Delete My Account
            </button>
            <button 
              className="delete-cancel-btn"
              onClick={() => setDeleteConfirm(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
