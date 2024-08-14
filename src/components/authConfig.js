export const msalConfig = {
    auth: {
      clientId: 'de6db120-667f-49e8-b95a-36df42dfcbf4', 
      authority: 'https://login.microsoftonline.com/common',
      // redirectUri: 'https://statuesque-unicorn-c45209.netlify.app' 
       redirectUri: "http://localhost:3001"
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    }
  };
  
  export const loginRequest = {
    scopes: ['User.Read']
  };