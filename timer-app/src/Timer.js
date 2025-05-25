import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(10);
  const [inputSeconds, setInputSeconds] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      setTimeExpired(true);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleStart = () => {
    setSeconds(inputSeconds);
    setIsActive(true);
    setTimeExpired(false);
  };

  const handleInputChange = (e) => {
    setInputSeconds(Number(e.target.value));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Таймер</h1>
      <div>
        <label>
          Введите количество секунд: 
          <input 
            type="number" 
            value={inputSeconds} 
            onChange={handleInputChange}
            min="1"
            style={{ margin: '0 10px', padding: '5px' }}
          />
        </label>
      </div>
      <button 
        onClick={handleStart}
        style={{ 
          margin: '20px', 
          padding: '10px 20px', 
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Старт
      </button>
      <div style={{ fontSize: '24px', margin: '20px' }}>
        Осталось секунд: {seconds}
      </div>
      {timeExpired && (
        <div style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>
          ВРЕМЯ ИСТЕКЛО
        </div>
      )}
    </div>
  );
}

export default Timer;