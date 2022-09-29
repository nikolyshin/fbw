import React, { useState } from 'react';
import Registration from './Registration';
import Login from './Login';

const Auth = () => {
  const [step, setStep] = useState('login');
  return (
    <div
      style={{
        position: 'absolute',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      {step === 'login' && <Login setStep={setStep} />}
      {step === 'registration' && <Registration setStep={setStep} />}
    </div>
  );
};

export default Auth;
