import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import LoginPage from './Login';
import ProfilePage from './ProfilePage'; // Import the new ProfilePage component
import { base_url } from '../services/BaseURL';
import UserManagement from './UserManagement';
import ProductsAndServices from './ProductsAndServices';

const Dashboard = () => {
    const [activeLink, setActiveLink] = useState('home');
    const [openLogin, setOpenLogin] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    const [user, setUser] = useState(null);
    const [applicationId,setApplicationId] = useState('');
    const [openUserManagement, setOpenUserManagement] = useState(false);
    // const ws = new WebSocket('wss://silly-fenglisu-45758b.netlify.app/your-websocket-endpoint');
    const ws = new WebSocket('http://localhost:3000');

    ws.onopen = () => {
        console.log('WebSocket connection opened');
    };

    ws.onmessage = (event) => {
      try {
          const data = JSON.parse(event.data);
  
          switch (data.type) {
              case 'appId':
                  console.log('Received Application ID:', data.appId);
                  setApplicationId(data.appId);
                  break;
              
              default:
                  console.log('Received unknown message type:', data);
                  break;
          }
      } catch (error) {
          console.error('Failed to parse message:', error);
      }
  };
  
  ws.onerror = (error) => {
      console.error('WebSocket error:', error);
  };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };

    const handleUserLogin = (userData) => {
        setUser(userData);
        setOpenLogin(false);
    };

    const handleLogin = () => {
        setOpenLogin(true);
    };

    const handleHome = () => {
        setOpenLogin(false);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('lastUsageDate');
        setUser(null);
    };

    const handleProfileClick = () => {
        setOpenProfile(true);
    };

    const updateExpiryDate = async (newExpiryDate) => {
      if (user) {
          const updatedUser = { ...user, expiryDate: newExpiryDate };

          // Update user data on JSON server
          try {
             const updateResponse= await fetch(`${base_url}/installation/${user.id}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(updatedUser),
              });
              
              if(!updateResponse.ok){
                alert('Failed to update user')
                throw new Error('Failed to update user');
              }
              else{
                // Update local user state and storage
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));

              // Send updated user data to WebSocket server
              if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: 'update', user: updatedUser }));
              }
              alert('Your subscription is extended....')

              }
              
          } catch (error) {
              console.error('Error updating user on JSON server:', error);
          }
      }
  };

  const handleUserManagementClick = () => {
    setOpenUserManagement(true);
};

const renderContent = () => {
  switch (activeLink) {
      case 'productsAndServices':
          return (
            <ProductsAndServices/>
          );
      case 'profile':
          return <ProfilePage user={user} onExpiryDateUpdate={updateExpiryDate} />;
      case 'userManagement':
          return <UserManagement />;
      case 'home':
      default:
          return <p>Welcome to the Dashboard. Click to sign up if you are a new user.</p>;
  }
};

    return (
        <div className="dashboard">
            <header>
                <img id="logoPD" src="images/logo-pd.png" alt="Logo" />
                {user ? (
                    <>
                        <div className='ms-auto me-4 pt-4' style={{ display: 'flex' }}>
                            <div>
                                <p style={{ color: 'white' }}>
                                    {user.username}
                                </p>
                                <img
                                    style={{ width: '20px', height: '20px', borderRadius: '50%', marginTop: '-50px', marginLeft: '10px' }}
                                    src={user.image || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9dB5ERe0v9QUXux7rr6TnHW9nNlvmZpWqqA&s'}
                                    alt="User"
                                />
                            </div>
                            <p
                                className='ms-3'
                                style={{ color: 'white', cursor: 'pointer' }}
                                onClick={handleLogout}
                            >
                                Sign Out
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <p
                            className='ms-auto pt-3'
                            style={{ color: 'white', cursor: 'pointer' }}
                            onClick={handleLogin}
                        >
                            Sign In
                        </p>
                        <img style={{ width: '20px', height: '20px', borderRadius: '50%' }} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9dB5ERe0v9QUXux7rr6TnHW9nNlvmZpWqqA&s" alt="img" />
                    </>
                )}
            </header>
            <div className="main-content">
                <aside className="sidebar">
                    <nav>
                        <ul>
                            <li>
                                <div style={{ cursor: 'pointer' }}  onClick={() => setActiveLink('home')}>
                                    <i className="fa-solid fa-house"></i> Home
                                </div>
                            </li>
                            <li>
                                <div style={{ cursor: 'pointer' }} onClick={() => setActiveLink('productsAndServices')}>
                                    <i className="fa-regular fa-cube"></i> Products and services
                                </div>
                            </li>
                            <li>
                                <div style={{ cursor: 'pointer' }} onClick={() => setActiveLink('userManagement')}>
                                    <i className="fa-solid fa-users"></i> User management
                                </div>
                            </li>
                            <li>
                                <div style={{ cursor: 'pointer' }} onClick={() => setActiveLink('section2')}>
                                    <i className="fa-regular fa-money-bills"></i> Billing and orders
                                </div>
                            </li>
                            <li>
                                <div style={{ cursor: 'pointer' }} onClick={() => setActiveLink('section3')}>
                                    <i className="fa-regular fa-folder"></i> Account
                                </div>
                            </li>
                            <li>
                                <div style={{ cursor: 'pointer' }} onClick={() => setActiveLink('profile')}>
                                    <i className="fa-regular fa-circle-user"></i> My profile and settings
                                </div>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <main className="content" style={{ textAlign: 'center' }}>
                {openLogin ? <LoginPage onLogin={handleUserLogin} applicationId={applicationId} /> :
                        renderContent()}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;
