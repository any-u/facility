import React, { useState, useEffect } from 'react';
import './layout.scss'

export default function Layout() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('执行...', count);
    return () => {
      console.log('清理...', count);
    };
  }, [count]);
  return (
    <div className='container'>
      <p>点击次数:  {count} 次1</p>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        Click me
      </button>
    </div>
  );
}
