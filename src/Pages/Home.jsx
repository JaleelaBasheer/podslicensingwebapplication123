import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import LoginPage from '../components/Login';

const Home = () => {
  return (
    <div className="dashboard">
     <Header/>
      <LoginPage/>
     <Footer/>
    </div>
  );
};

export default Home;
