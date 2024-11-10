import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Heart, 
  ArrowLeft, 
  Edit2, 
  Check, 
  ChefHat, 
  Utensils, 
  AlertCircle 
} from 'lucide-react';
import './AccountFonts.css';

// Color Constants
const colors = {
  background: '#E5D5CC',  // Beige background
  sage: '#8C9A8E',       // Sage green
  light: '#D3D3C7',      // Light sage
  apple: '#C76D5E',      // Red apple
  potato: '#DEB887',     // Light brown
  carrot: '#FF7F50',     // Orange
  eggplant: '#614051',   // Purple
  lettuce: '#90EE90',    // Light green
  tomato: '#FF6347',     // Red
  mushroom: '#DEB887',   // Beige
  spice: '#FFD700',      // Yellow
  error: '#ff4444'       // Error red
};

// Reusable Styles
const floatingElement = {
  position: 'absolute',
  borderRadius: '50% 60% 50% 70%',
  opacity: '0.3',
  zIndex: 0,
  pointerEvents: 'none',
};

const buttonBaseStyle = {
  padding: '12px 24px',
  backgroundColor: colors.light,
  border: 'none',
  borderRadius: '25px',
  fontFamily: 'serif',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.3s ease',
};

interface AccountSettingsProps {
  onBack: () => void;
}


const AccountSettings: React.FC<AccountSettingsProps> = ({ onBack }) => {
  // State Management
  const [profileImage, setProfileImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: 'Sanjith',
    username: 'AryavBiggestFan',
    password: '********',
    email: 'testing@gmail.com'
  });
  const [tempUserInfo, setTempUserInfo] = useState({...userInfo});

  // Helper Functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setSuccess('Profile photo updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.onerror = () => {
        setError('Error uploading image');
        setTimeout(() => setError(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = () => {
    if (!validateEmail(tempUserInfo.email)) {
      setError('Please enter a valid email address');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUserInfo({...tempUserInfo});
      setEditMode(false);
      setLoading(false);
      setSuccess('Changes saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const toggleEditMode = () => {
    if (editMode) {
      handleSave();
    } else {
      setTempUserInfo({...userInfo});
      setEditMode(true);
    }
  };

  // Generate random floating elements
  const generateFloatingElements = () => {
    const elements = [];
    const foodTypes = [
      { color: colors.apple, size: 200 },
      { color: colors.potato, size: 150 },
      { color: colors.carrot, size: 180 },
      { color: colors.eggplant, size: 160 },
      { color: colors.lettuce, size: 140 },
      { color: colors.tomato, size: 120 },
      { color: colors.mushroom, size: 100 }
    ];

    foodTypes.forEach((food, index) => {
      elements.push(
        <div
          key={`food-${index}`}
          style={{
            ...floatingElement,
            width: `${food.size}px`,
            height: `${food.size}px`,
            backgroundColor: food.color,
            left: `${Math.random() * 80}%`,
            top: `${Math.random() * 80}%`,
            animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      );
    });

    // Add spice sprinkles
    for (let i = 0; i < 8; i++) {
      elements.push(
        <div
          key={`spice-${i}`}
          style={{
            ...floatingElement,
            width: '20px',
            height: '20px',
            backgroundColor: colors.spice,
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
            animation: `spiceFloat ${3 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      );
    }

    // Add utensil icons
    for (let i = 0; i < 5; i++) {
      elements.push(
        <div
          key={`utensil-${i}`}
          style={{
            position: 'absolute',
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
            opacity: 0.2,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            zIndex: 0,
          }}
        >
          <Utensils size={24} />
        </div>
      );
    }

    return elements;
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: colors.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Elements */}
      {generateFloatingElements()}

      {/* Notification Messages */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: colors.error,
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          animation: 'slideDown 0.3s ease-out'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: colors.sage,
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          animation: 'slideDown 0.3s ease-out'
        }}>
          <Check size={20} />
          {success}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <h1 style={{
            fontSize: '48px',
            marginBottom: '8px',
            fontFamily: 'serif',
            position: 'relative',
            display: 'inline-block'
          }}>
            Ingrediate
            <div style={{
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '100%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #8C9A8E, transparent)',
              transform: 'scaleX(0)',
              animation: 'expandWidth 1s ease-out forwards'
            }}></div>
          </h1>
          <p style={{
            fontSize: '20px',
            fontFamily: 'serif'
          }}>
            Turning Nothing, Into Something.
          </p>
        </div>

        {/* Profile Photo Upload */}
        <div style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: colors.light,
          position: 'relative',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '3px solid black',
          overflow: 'hidden',
          transition: 'transform 0.3s ease',
        }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            id="profile-upload"
          />
          <label htmlFor="profile-upload" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#000000',
                position: 'relative'
              }}>
                <ChefHat 
                size={24} 
                style={{ 
                    position: 'absolute',
                    top: '-30px',
                    right: '-10px',
                    // Remove the animation line:
                    // animation: 'float 3s ease-in-out infinite'
                }} 
                />
                <p style={{
                  fontSize: '16px',
                  fontFamily: 'serif'
                }}>
                  Upload
                </p>
                <p style={{
                  fontSize: '16px',
                  fontFamily: 'serif'
                }}>
                  profile photo
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Account Information Card */}
        <div style={{
          backgroundColor: colors.sage,
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          transition: 'transform 0.3s ease',
          transform: editMode ? 'scale(1.02)' : 'scale(1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontFamily: 'serif',
            textAlign: 'center',
            marginBottom: '24px',
            backgroundColor: colors.light,
            padding: '12px',
            borderRadius: '8px'
          }}>
            Account Information
          </h2>

          {Object.entries(editMode ? tempUserInfo : userInfo).map(([key, value]) => (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              gap: '16px'
            }}>
              <div style={{
                backgroundColor: colors.light,
                padding: '12px 20px',
                borderRadius: '25px',
                width: '40%',
                fontFamily: 'serif'
              }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
              <div style={{
                backgroundColor: colors.light,
                padding: '12px 20px',
                borderRadius: '25px',
                width: '60%',
                fontFamily: 'serif',
                cursor: editMode ? 'text' : 'default',
                transition: 'all 0.3s ease',
                boxShadow: editMode ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
              }}>
                {editMode ? (
                  <input
                    type={key === 'password' ? 'password' : 'text'}
                    value={tempUserInfo[key]}
                    onChange={(e) => setTempUserInfo({
                      ...tempUserInfo,
                      [key]: e.target.value
                    })}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      width: '100%',
                      fontFamily: 'serif',
                      outline: 'none'
                    }}
                  />
                ) : (
                  value
                )}
              </div>
            </div>
          ))}

          {/* Favorites Button */}
          <button style={{
            ...buttonBaseStyle,
            width: '100%',
            marginTop: '16px',
            justifyContent: 'center'
          }}>
            <Heart size={20} />
            Favorites
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '24px'
        }}>
          <button onClick={onBack} style={buttonBaseStyle}>
            <ArrowLeft size={20} />
            Back
          </button>
          <button 
            onClick={toggleEditMode}
            style={buttonBaseStyle}
          >
            {loading ? (
              <div style={{ animation: 'spin 1s linear infinite' }}>
                ⌛
              </div>
            ) : (
              <>
                {editMode ? <Check size={20} /> : <Edit2 size={20} />}
                {editMode ? 'Save' : 'Edit'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;