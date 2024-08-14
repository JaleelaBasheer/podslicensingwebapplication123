import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import { useMsal } from '@azure/msal-react';
import { base_url } from '../services/BaseURL';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';



const LoginPage = ({onLogin,applicationId}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const[passwordReset,setPasswordReset] = useState('');
  const[confirmpasswordReset,setConfirmPasswordReset] = useState('');
  const [profile, setProfile] = useState(null);
   const { instance, accounts } = useMsal();

  //  const ws = new WebSocket('wss://https://statuesque-unicorn-c45209.netlify.app/your-websocket-endpoint');
   const ws = new WebSocket('http://localhost:3000');

   const login = useGoogleLogin({
    onSuccess: async (response) => {
      const token = response.credential;
      try {
        // Fetch user info from Google
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });
        const userInfo = userInfoResponse.data;
        console.log(userInfo);

        // Check if the user already exists in your server
        const userCheckResponse = await fetch(`${base_url}/installation?email=${encodeURIComponent(userInfo.email)}`);
        const userCheckData = await userCheckResponse.json();
        console.log(userCheckData)

        if (userCheckData.length === 0) {
          // User does not exist, register them
          const registrationData = {
            applicationId:applicationId,
            username: userInfo.name || userInfo.email.split('@')[0],
            email: userInfo.email,
            password: CryptoJS.SHA256(token).toString(), 
            image:userInfo.picture,
            registrationDate: new Date().toISOString(),
            expiryDate:  new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
          };
          console.log(registrationData)
          // const expiryDate = new Date(new Date().getTime() + 10 * 60 * 1000).toISOString();
          // new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),

          const registrationResponse = await fetch(`${base_url}/installation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData),
          });
  
          // Check if the registration was successful
          if (!registrationResponse.ok) {
            throw new Error('Failed to register user');
          }
          else{
            const registrationResult = await registrationResponse.json();
            console.log('Registration Response:', registrationResult);
    
            alert('Registration successful. You are now logged in.');
            localStorage.setItem('user', JSON.stringify(registrationResult));
            localStorage.setItem('lastUsageDate', new Date().toISOString());
            onLogin(registrationResult);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'logindata', user: registrationResult }));
            }
          }
  
         
        } else {
          alert('Login successful.');
          onLogin(userCheckData[0]);
          localStorage.setItem('user', JSON.stringify(userCheckData[0]));
          localStorage.setItem('lastUsageDate', new Date().toISOString());
        }
       
        setProfile(userInfo);
      } catch (error) {
        console.error('Google login error:', error);
        alert('An error occurred with Google login. Please try again.');
      }
    },
    onError: (error) => {
      console.log('Login Failed:', error);
    },
  });


  // Function to handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      alert('Please enter all fields.');
      return;
    }

    setLoading(true);
    const currentDateTime = new Date().toISOString();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // Set expiry date to 30 days from now
    const expiryDateTime = expiryDate.toISOString();
    const hashedPassword = CryptoJS.SHA256(password).toString();

    const dataToSend = {
      applicationId,
      username,
      email,
      password: hashedPassword,
      registrationDate: currentDateTime,
      expiryDate: expiryDateTime,
    };

    try {
      const emailCheckResponse = await fetch(`${base_url}/installation?email=${encodeURIComponent(email)}`);
      const emailCheckData = await emailCheckResponse.json();

      if (emailCheckData.length > 0) {
        throw new Error('Email already exists');
      }

      const response = await fetch(`${base_url}/installation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      console.log('Response from JSON server:', data);
      setUsername('');
      setEmail('');
      setPassword('');
      setIsRegistering(false);
      alert('You are successfully registered');
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message === 'Email already exists'
        ? 'Email already exists. If you have an account, please log in.'
        : 'An error occurred. Please try again.');
      setUsername('');
      setEmail('');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSetup = ()=>{
    setEmail('');
    setPassword('');
     setIsRegistering(true);
  }

  // Custom login handler
  const handleLogin = async () => {
    if (email && password) {
        setLoading(true);

        try {
            const response = await fetch(`${base_url}/installation?email=${encodeURIComponent(email)}`);
            const userData = await response.json();

            if (userData.length > 0) {
                const hashedPassword = CryptoJS.SHA256(password).toString();
                if (userData[0].password === hashedPassword) {
                    localStorage.setItem('user', JSON.stringify(userData[0]));
                    localStorage.setItem('lastUsageDate', new Date().toISOString());
                    onLogin(userData[0]); // Pass user data to the parent component
                    if (ws.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify(userData[0]));
                    }
                } else {
                    alert('Invalid email or password.');
                }
            } else {
                alert('Invalid email or password.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    } else {
        alert('Please enter both email and password.');
    }
};

  // Reset password handler
  const handleResetPassword = async () => {
    if (resetEmail && passwordReset && confirmpasswordReset) {
      
      if (passwordReset === confirmpasswordReset) {
        try {
          // Check if the user exists
          const response = await fetch(`${base_url}/installation?email=${encodeURIComponent(resetEmail)}`);
          const userData = await response.json();
  
          if (userData.length > 0) {
            const user = userData[0];
            const appId = user.id;
            
            // Hash the new password
            const hashedPassword = CryptoJS.SHA256(passwordReset).toString();
            
            // Update the password in the database
            const updateResponse = await fetch(`${base_url}/installation/${appId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ...userData,password: hashedPassword }),
            });
  
            if (updateResponse.ok) {
                alert('Password updated successfully.');
              setIsResetting(false);
            } else {
              throw new Error('Failed to update password.');
            }
          } else {
            alert('No user found with that email address.');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Failed to update password.');
        }
      } else {
        alert('Mismatch in password and confirm password.');
      }
    } else {
        alert('Please enter your email and new password.');
    }
  };
  

// Microsoft Login handler

// const handleMicrosoftLogin = async () => {
//   try {
//     // Perform Microsoft login
//     const response = await instance.loginPopup(loginRequest);
//     const accessToken = response.accessToken;

//     // Fetch user info from Microsoft Graph API
//     const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`
//       }
//     });
//     const userInfo = await userInfoResponse.json();
//     console.log(userInfo);

//     // Check if the user already exists in your server
//     const userCheckResponse = await fetch(`${base_url}/installation?email=${encodeURIComponent(userInfo.userPrincipalName)}`);
//     const userCheckData = await userCheckResponse.json();
//     console.log(userCheckData);

//     if (userCheckData.length === 0) {
//       // User does not exist, register them
//       const registrationData = {
//         username: userInfo.displayName || userInfo.userPrincipalName.split('@')[0],
//         email: userInfo.userPrincipalName,
//         password: CryptoJS.SHA256(accessToken).toString(), // Consider using a more secure method for handling passwords
//         image: userInfo.photo, // If available
//         registrationDate: new Date().toISOString(),
//         expiryDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
//       };
//       console.log(registrationData);

//       await fetch(`${base_url}/installation`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(registrationData),
//       });

//       alert('Registration successful. You are now logged in.');
//       localStorage.setItem('user', JSON.stringify(registrationData));
//       localStorage.setItem('lastUsageDate', new Date().toISOString());
//       onLogin(registrationData);
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify(registrationData));
//       }
//     } else {
//       alert('Login successful.');
//       onLogin(userCheckData[0]);
//       localStorage.setItem('user', JSON.stringify(userCheckData[0]));
//       localStorage.setItem('lastUsageDate', new Date().toISOString());
//     }

//     setProfile(userInfo);
//   } catch (error) {
//     console.error('Microsoft login error:', error);
//     alert('An error occurred with Microsoft login. Please try again.');
//   }
// };
 // Microsoft Login Handler
 const handleMicrosoftLogin = async () => {
  try {
    // Perform Microsoft login using popup
    const response = await instance.loginPopup({
      scopes: ["User.Read"]
    });
    const accessToken = response.accessToken;

    // Fetch user info from Microsoft Graph API
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const userInfo = await userInfoResponse.json();

    // Check if the user already exists in your server
    const userCheckResponse = await fetch(`${base_url}/installation?email=${encodeURIComponent(userInfo.userPrincipalName)}`);
    const userCheckData = await userCheckResponse.json();

    if (userCheckData.length === 0) {
      // User does not exist, register them
      const registrationData = {
        applicationId:applicationId,
        username: userInfo.displayName || userInfo.userPrincipalName.split('@')[0],
        email: userInfo.userPrincipalName,
        password: CryptoJS.SHA256(accessToken).toString(), 
        image: userInfo.photo, // If available
        registrationDate: new Date().toISOString(),
        expiryDate: new Date(new Date().getTime() + 10 * 60 * 1000).toISOString(),
      };

      const registrationResponse = await fetch(`${base_url}/installation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      // Check if the registration was successful
      if (!registrationResponse.ok) {
        throw new Error('Failed to register user');
      }
      else{
        const registrationResult = await registrationResponse.json();
        console.log('Registration Response:', registrationResult);

        alert('Registration successful. You are now logged in.');
        localStorage.setItem('user', JSON.stringify(registrationResult));
        localStorage.setItem('lastUsageDate', new Date().toISOString());
        onLogin(registrationResult);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'logindata', user: registrationResult }));
        }
      }

     
    } else {
      alert('Login successful.');
      onLogin(userCheckData[0]);
      localStorage.setItem('user', JSON.stringify(userCheckData[0]));
      localStorage.setItem('lastUsageDate', new Date().toISOString());
    }
   
    setProfile(userInfo);
  } catch (error) {
    console.error('Microsoft login error:', error);
    alert('An error occurred with Microsoft login. Please try again.');
  }
};

  return (
    <>
     
    <div className="setup-container">
      <div className="setup-box">
        {isRegistering ? (
          <>
            <h2>Register</h2>
            <input type="text" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
        <br />
        
          <input placeholder='Email address' type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <br />
     
          <input placeholder='Password' type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button
          className="setup-button btn-primary w-100"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Register'}
        </button>
        <p className='mt-2'>
              Already registered? <a onClick={() => setIsRegistering(false)} style={{color:'blue',cursor:'pointer'}}>Login here..</a>
            </p>
          
          </>
        ) : isResetting ? (
          <>
            <h2>Reset Password</h2>
            <label>
              Email:
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </label>
            <br />
            <label>
              Password:
              <input
                type="password"
                value={passwordReset}
                onChange={(e) => setPasswordReset(e.target.value)}
              />
            </label>
            <br />
            <label>
              Confirm password:
              <input
                type="password"
                value={confirmpasswordReset}
                onChange={(e) => setConfirmPasswordReset(e.target.value)}
              />
            </label>
            <br />
            <button
              className="setup-button"
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset'}
            </button>
            <button
              className="setup-button ms-3"
              onClick={() => setIsResetting(false)}
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 className='text-center'>Welcome</h2>
            <input
              type="email"
              value={email}
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <p>
              <a style={{ cursor: 'pointer', color: 'blue' }} onClick={() => setIsResetting(true)}>
                Reset Password?
              </a>
            </p>
            <button
              className="setup-button btn btn-primary w-100"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Continue'}
            </button>
            <p className='mt-2'>
              Don't have an account? <a style={{ color: 'blue' ,cursor:'pointer'}} onClick={handleUserSetup}>Sign up...</a>
            </p>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '150px', height: '1px', backgroundColor: 'grey' }}></div>
              <p>OR</p>
              <div style={{ width: '150px', height: '1px', backgroundColor: 'grey' }}></div>
            </div>
            <div onClick={() => login()}
              className='btn' style={{ width: '100%', padding: '10px', border: 'solid', borderBlockColor: 'grey', borderRadius: '10px', borderWidth: '1px' }}>
              <img style={{ width: '30px', height: '30px' }} src="https://www.pngmart.com/files/16/Google-Logo-PNG-Image.png" alt="" />
             {loading ? 'Submitting...' : ' Continue with Google'}
            </div>
       
            <div
              className='btn mt-2'onClick={handleMicrosoftLogin}
             
              style={{ width: '100%', padding: '10px', border: 'solid', borderBlockColor: 'grey', borderRadius: '10px', borderWidth: '1px' }}
            >
              <img style={{ width: '30px', height: '30px' }} src="https://cdn-icons-png.flaticon.com/512/732/732221.png" alt="" />
              {loading ? 'Submitting...' : 'Continue with Microsoft'}
            </div>
        
          </>
        )}
      </div>
    </div>
    </>
   
  );
};

export default LoginPage;
