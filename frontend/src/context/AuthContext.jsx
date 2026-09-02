import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/current-user');
      if (res.data?.data) {
        setUser(res.data.data);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const requestLoginOtp = async (email, password) => {
    try {
      const res = await api.post('/users/request-otp', { email, password });
      showNotification('OTP sent to your email successfully!', 'success');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const login = async (email, otp) => {
    try {
      const res = await api.post('/users/login', { email, otp });
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
        showNotification(`Welcome back, ${res.data.data.user.fullname || res.data.data.user.username}!`, 'success');
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showNotification('Registration successful! Please log in.', 'success');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      setUser(null);
      showNotification('Logged out successfully', 'info');
    } catch (err) {
      setUser(null);
    }
  };

  const updatePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      const res = await api.patch('/users/update-password', {
        oldPassword,
        newPassword,
        confirmPassword,
      });
      showNotification('Password updated successfully!', 'success');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const updateProfilePhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const res = await api.patch('/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showNotification('Profile photo updated!', 'success');
      fetchCurrentUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update photo';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const removeProfilePhoto = async () => {
    try {
      const res = await api.delete('/users/remove-profile-photo');
      showNotification('Profile photo removed', 'info');
      fetchCurrentUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove photo';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const forgetPasswordOtp = async (email) => {
    try {
      const res = await api.post('/users/forget-password', { email });
      showNotification('Reset password OTP sent to your email!', 'success');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset OTP';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const verifyOtpPasswordReset = async (email, otp) => {
    try {
      const res = await api.post('/users/verify-otp', { email, otp });
      showNotification('OTP verified! Enter your new password.', 'success');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const resetPassword = async (newPassword, confirmPassword) => {
    try {
      const res = await api.patch('/users/reset-password', {
        newPassword,
        confirmPassword,
      });
      showNotification('Password reset successfully! Please log in with your new password.', 'success');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/users/delete-user');
      setUser(null);
      showNotification('Account deleted successfully', 'info');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account';
      showNotification(msg, 'error');
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        notification,
        showNotification,
        requestLoginOtp,
        login,
        register,
        logout,
        updatePassword,
        updateProfilePhoto,
        removeProfilePhoto,
        forgetPasswordOtp,
        verifyOtpPasswordReset,
        resetPassword,
        deleteAccount,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
