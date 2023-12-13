import React, { useState } from 'react';
import SignMessage from './SignMessage';
import VerifyMessage from './VerifyMessage';

function LandingPage({ onOptionSelect }) {
  return (
    <div className="container h-screen flex justify-center">
        <button onClick={() => onOptionSelect('issue')} className="py-4 h-14 mr-5 px-8 bg-blue-500 text-white rounded-lg mb-2">Issue</button>
        <button onClick={() => onOptionSelect('verify')} className="py-4 h-14 ml-5 px-8 bg-green-500 text-white rounded-lg mb-2">Verify</button> 
    </div>
  );
}


function App() {
  const [selectedOption, setSelectedOption] = useState(null);

  function handleOptionSelect(option) {
    setSelectedOption(option);
  }

  function renderPage() {
    switch (selectedOption) {
      case 'issue':
        return <SignMessage />;
      case 'verify':
        return <VerifyMessage />;
      default:
        return (
          <div>
            <h1 className="text-3xl font-bold text-blue-500 text-center m-10">
              Drivers License Credential
            </h1>
          <LandingPage onOptionSelect={handleOptionSelect} />
          </div>
          );
    }
  }
  return(
    <div className="container mx-auto">
      {renderPage()}
      {selectedOption && (
        <button 
          className='py-2 px-4 bg-gray-500 text-white rounded-lg absolute bottom-0 left-0 mb-6 ml-6'
          style={{ position: 'fixed'}}
          onClick={() => setSelectedOption(null)}>
            Go Back
        </button>
      )}
    </div>
  )
}

export default App;
