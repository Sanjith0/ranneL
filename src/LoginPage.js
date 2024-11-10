import { AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Camera, ChevronRight, User, Lock, Loader2, ArrowRight, Mail, UserPlus } from 'lucide-react';
import './LoginPage.css'
import GenerateRecipesPage from './GenerateRecipesPage.tsx';
import bannerPNG from './kitchenBanner.png';

const LoginPage = () => {
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignUpClicked, setIsSignUpClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [isHovered, setIsHovered] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const [passwordError, setPasswordError] = useState(false);

  const handleSignUpClick = () => {
    if (showSignUpForm) {
      // Check if passwords match
      if (formState.password !== formState.confirmPassword) {
        setPasswordError(true);
        // Hide error message after 3 seconds
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
  const errorMessageStyle = {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ff4444',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    opacity: passwordError ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: passwordError ? 'auto' : 'none',
    zIndex: 1000,
  };


  // Main page component
  if (currentPage === 'main') {
    return <GenerateRecipesPage />;
  }

  const buttonBaseStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
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
    gap: '8px'
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'serif',
    border: '2px solid transparent',
    backgroundColor: '#D3D3C7',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#DDBEA9',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0px',
      paddingTop: '210px',
      transition: 'all 0.5s ease'
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
        borderRadius: '8px',
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
        marginBottom: '40px',
        transform: (isLoginClicked || isSignUpClicked) ? 'translateY(-20px)' : 'translateY(0)',
        opacity: (isLoginClicked || isSignUpClicked) ? 0 : 1,
        transition: 'all 0.5s ease',
        animation: 'float 6s ease-in-out infinite'
      }}>
        <h1 style={{
          fontSize: '48px',
          marginBottom: '16px',
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
          fontFamily: 'serif',
          opacity: '0.9'
        }}>
          Turning Nothing, Into Something.
        </p>
      </div>
      
      
      {/* Forms Container */}
      <div style={{
        backgroundColor: 'rgba(140, 154, 142, 0.9)',
        padding: '24px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        transform: (isLoginClicked || isSignUpClicked) ? 'translateY(20px)' : 'translateY(0)',
        transition: 'all 0.5s ease'
      }}>
        {showLoginForm ? (
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
              type="password"
              placeholder="Confirm Password"
              value={formState.confirmPassword}
              onChange={(e) => {
                setFormState({...formState, confirmPassword: e.target.value});
                setPasswordError(false); // Clear error when typing
              }}
              style={{
                ...inputBaseStyle,
                borderColor: passwordError ? '#ff4444' : formState.confirmPassword ? '#8C9A8E' : 'transparent',
                borderWidth: '2px'
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
              backgroundColor: isLoginClicked ? '#000000' : '#D3D3C7',
              color: isLoginClicked ? '#FFFFFF' : '#000000',
              transform: isLoginClicked 
                ? 'scale(0.95)' 
                : isHovered === 'login' 
                  ? 'scale(1.10)' 
                  : 'scale(1)',
              boxShadow: isHovered === 'login' 
                ? '0 6px 20px rgba(0, 0, 0, 0.15)' 
                : '0 2px 10px rgba(0, 0, 0, 0.1)',
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
              backgroundColor: isSignUpClicked ? '#000000' : '#D3D3C7',
              color: isSignUpClicked ? '#FFFFFF' : '#000000',
              transform: isSignUpClicked 
                ? 'scale(0.95)' 
                : isHovered === 'signup' 
                  ? 'scale(1.10)' 
                  : 'scale(1)',
              boxShadow: isHovered === 'signup' 
                ? '0 6px 20px rgba(0, 0, 0, 0.15)' 
                : '0 2px 10px rgba(0, 0, 0, 0.1)',
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
      <div className="w-full mt-auto">
          <img src={bannerPNG} alt="Banner" className="w-full h-auto" style={{ objectFit: 'cover' }} />
        </div>
    </div>
  );
  
};

export default LoginPage;
