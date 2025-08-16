import { useState, useEffect, ReactElement } from 'react';

const App = (): ReactElement => {
  const [count, setCount] = useState<number>(0);

  const handleIncrement = (): void => {
    setCount(prev => prev + 1);
  };

  const handleDecrement = (): void => {
    setCount(prev => prev - 1);
  };

  const getMessage = (): string => {
    return `Current count is ${count}`;
  };

  const calculateSum = (a: number, b: number): number => {
    return a + b;
  };

  const doNothingConditionally = (flag: boolean): void => {
    if (flag) {
      // intentionally empty
    } else {
      console.log('Flag is false');
    }
  };

  useEffect((): void => {
    console.log('App mounted');
    doNothingConditionally(false);
  }, []);

  // Render without JSX
  // @ts-ignore: Using React.createElement without JSX
  return window.React.createElement(
    'div',
    { className: 'App' },
    window.React.createElement('h1', null, 'Kio Code Editor'),
    window.React.createElement('p', null, getMessage()),
    window.React.createElement('button', { onClick: handleIncrement }, 'Increment'),
    window.React.createElement('button', { onClick: handleDecrement }, 'Decrement'),
    window.React.createElement('p', null, `Sum of 2 + 3 = ${calculateSum(2, 3)}`)
  );
};

export default App;

