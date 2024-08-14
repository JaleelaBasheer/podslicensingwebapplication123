import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './components/authConfig';

const root = ReactDOM.createRoot(document.getElementById('root'));
const msalInstance = new PublicClientApplication(msalConfig);
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <GoogleOAuthProvider clientId="554295880362-cbv31utseo4gtkpvgod3ldmm8028eidn.apps.googleusercontent.com">
    <MsalProvider instance={msalInstance}>
    <App />
  </MsalProvider>,  
  </GoogleOAuthProvider>    
  </BrowserRouter>
  </React.StrictMode>
);

