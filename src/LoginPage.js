import { AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Camera, ChevronRight, User, Lock, Loader2, ArrowRight, Mail, UserPlus } from 'lucide-react';
import './LoginPage.css';
import RannelApp from './RannelApp.tsx';
import bannerPNG from './rightBanner.png';
import logoImage from './logo2.png'; 

const LoginPage = () => {
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignUpClicked, setIsSignUpClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [isHovered, setIsHovered] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [formState, setFormState] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  });

  const handleLoginClick = () => {
    if (!showLoginForm) {
      setIsLoginClicked(true);
      setTimeout(() => {
        setShowLoginForm(true);
        setIsLoginClicked(false);
      }, 500);
      return;
    }
    
    setLoading(true);
    setIsLoginClicked(true);
    
    setTimeout(() => {
      setLoading(false);
      setCurrentPage('main');
    }, 1500);
  };

  const handleSignUpClick = () => {
    if (showSignUpForm) {
      if (formState.password !== formState.confirmPassword) {
        setPasswordError(true);
        setTimeout(() => {
          setPasswordError(false);
        }, 3000);
        return;
      }
      setPasswordError(false);
    }

    if (!showSignUpForm) {
      setIsSignUpClicked(true);
      setTimeout(() => {
        setShowSignUpForm(true);
        setIsSignUpClicked(false);
      }, 500);
      return;
    }
    
    setLoading(true);
    setIsSignUpClicked(true);
    
    setTimeout(() => {
      setLoading(false);
      setCurrentPage('main');
    }, 1500);
  };

  if (currentPage === 'main') {
    return <RannelApp />;
  }

  const buttonBaseStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '18px',
    fontFamily: 'serif',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    letterSpacing: '0.5px',
    fontWeight: '500'
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'serif',
    border: '2px solid transparent',
    backgroundColor: 'rgba(211, 211, 199, 0.4)',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };

  return (
    <div style={{ 
      height: '100vh',
      background: 'linear-gradient(135deg, #F5F5F5 0%, #235CA3 100%)', // Changed to neutral gray gradient
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '10px',
      paddingTop: '20px',
      transition: 'all 0.5s ease',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '-5px'
    }}>
      {/* Error Message Popup */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        opacity: passwordError ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: passwordError ? 'auto' : 'none',
        zIndex: 1000,
      }}>
        <AlertCircle size={20} />
        <span style={{ fontFamily: 'serif' }}>Password mismatch, please try again.</span>
      </div>

      {/* Title and Tagline */}
      <div style={{
  textAlign: 'center',
  marginBottom: '50px',
  marginTop: '20px', // Added margin top to move logo down
  transform: (isLoginClicked || isSignUpClicked) ? 'translateY(-20px)' : 'translateY(0)',
  opacity: (isLoginClicked || isSignUpClicked) ? 0 : 1,
  transition: 'all 0.5s ease',
  animation: 'float 6s ease-in-out infinite'
}}>
  <div style={{
    position: 'relative',
    display: 'inline-block',
    marginBottom: '20px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
  }}>
    <img 
      src={logoImage} 
      alt="Rannel Logo"
      style={{
        height: '230px', // Increased from 180px to 200px
        width: 'auto',
        marginBottom: '40px',
        transition: 'transform 0.3s ease'
      }}
    />
  </div>
  <p style={{
    fontSize: '24px',
    fontFamily: 'serif',
    opacity: '0.9',
    color: '#2F3E46',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    letterSpacing: '0.5px',
    marginBottom: '30px' // Added margin bottom to create more space
  }}>
    Open the Door to a Brighter Future.

    
  </p>
  <br></br>
  <p style={{
    fontSize: '24px',
    fontFamily: 'serif',
    opacity: '0.9',
    color: '#2F3E46',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    letterSpacing: '0.5px',
    marginBottom: '30px' // Added margin bottom to create more space
  }}>
  The testing account is already logged in. Press (Login) to proceed
  </p>
</div>
      
<div style={{
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  padding: '28px',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '340px',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
  backdropFilter: 'blur(10px)',
  transform: (isLoginClicked || isSignUpClicked) ? 'translateY(20px)' : 'translateY(0)',
  transition: 'all 0.5s ease',
  marginTop: '0.5px' // Added margin top
}}>
        {showLoginForm ? (
          <>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="rannelTesting"
                value={formState.username}
                onChange={(e) => setFormState({...formState, username: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.username ? '#8C9A8E' : 'transparent'
                }}
              />
              <User 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.username ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                placeholder="webApp1!"
                value={formState.confirmPassword}
                onChange={(e) => {
                  setFormState({...formState, confirmPassword: e.target.value});
                  setPasswordError(false);
                }}
                style={{
                  ...inputBaseStyle,
                  borderColor: passwordError ? '#ff4444' : formState.confirmPassword ? '#8C9A8E' : 'transparent'
                }}
              />
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: passwordError ? '#ff4444' : formState.confirmPassword ? '#8C9A8E' : '#666'
                }}
              />
            </div>
          </>
        ) : showSignUpForm ? (
          <>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Username"
                value={formState.username}
                onChange={(e) => setFormState({...formState, username: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.username ? '#8C9A8E' : 'transparent'
                }}
              />
              <User 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.username ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                placeholder="Email"
                value={formState.email}
                onChange={(e) => setFormState({...formState, email: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.email ? '#8C9A8E' : 'transparent'
                }}
              />
              <Mail 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.email ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                placeholder="Password"
                value={formState.password}
                onChange={(e) => setFormState({...formState, password: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.password ? '#8C9A8E' : 'transparent'
                }}
              />
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.password ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                placeholder="Confirm Password"
                value={formState.confirmPassword}
                onChange={(e) => setFormState({...formState, confirmPassword: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.confirmPassword ? '#8C9A8E' : 'transparent'
                }}
              />
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.confirmPassword ? '#8C9A8E' : '#666'
                }}
              />
            </div>
          </>
        ) : null}

        {!showSignUpForm && (
          <button 
          onClick={handleLoginClick}
          onMouseEnter={() => setIsHovered('login')}
          onMouseLeave={() => setIsHovered(null)}
          style={{
            ...buttonBaseStyle,
            backgroundColor: isLoginClicked ? '#1A4B82' : '#3c7eb8', // Changed to match gradient blue
            color: '#FFFFFF', // Changed to white for better contrast
            transform: isLoginClicked 
              ? 'scale(0.95)' 
              : isHovered === 'login' 
                ? 'scale(1.10)' 
                : 'scale(1)',
            boxShadow: isHovered === 'login' 
              ? '0 6px 20px rgba(35, 92, 163, 0.3)' 
              : '0 2px 10px rgba(35, 92, 163, 0.2)',
          }}
        >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {showLoginForm ? 'Submit' : 'Login'}
                </span>
                {!showLoginForm && <ArrowRight size={20} />}
              </>
            )}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: isHovered === 'login' ? '0' : '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transform: 'translateY(-50%)',
              transition: 'left 0.5s ease',
            }}></div>
          </button>
        )}

        {!showLoginForm && (
          <button 
          onClick={handleSignUpClick}
          onMouseEnter={() => setIsHovered('signup')}
          onMouseLeave={() => setIsHovered(null)}
          style={{
            ...buttonBaseStyle,
            backgroundColor: isSignUpClicked ? '#1A4B82' : '#3c7eb8', // Changed to match gradient blue
            color: '#FFFFFF', // Changed to white for better contrast
            transform: isSignUpClicked 
              ? 'scale(0.95)' 
              : isHovered === 'signup' 
                ? 'scale(1.10)' 
                : 'scale(1)',
            boxShadow: isHovered === 'signup' 
              ? '0 6px 20px rgba(35, 92, 163, 0.3)' 
              : '0 2px 10px rgba(35, 92, 163, 0.2)',
          }}
        >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {showSignUpForm ? 'Create Account' : 'Sign Up'}
                </span>
                {!showSignUpForm && <UserPlus size={20} />}
              </>
            )}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: isHovered === 'signup' ? '0' : '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transform: 'translateY(-50%)',
              transition: 'left 0.5s ease',
            }}></div>
          </button>
        )}

        {(showLoginForm || showSignUpForm) && (
          <button 
            onClick={() => {
              setShowLoginForm(false);
              setShowSignUpForm(false);
              setFormState({
                username: '',
                password: '',
                email: '',
                confirmPassword: ''
              });
            }}
            style={{
              ...buttonBaseStyle,
              backgroundColor: 'transparent',
              color: '#000000',
              fontSize: '14px',
              padding: '8px'
            }}
          >
            Back to menu
          </button>
        )}
        
      </div>
      <div style={{ 
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '50px',
  zIndex: 10
}}>
  </div>
<div className="w-full mt-auto" style={{ 
  marginBottom: '-18px',
  width: '105%',  // Make container wider than viewport
  marginLeft: '-2%'  // Center the wider container
}}>
  <img 
    src={bannerPNG} 
    alt="Banner" 
    className="w-full h-auto" 
    style={{ 
      objectFit: 'cover',
      width: '100%'  // Make image fill the wider container
    }} 
  />
</div>
    </div>
  );
  
};

export default LoginPage;