import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CookiesProvider>
  </React.StrictMode>
);

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import { BrowserRouter } from 'react-router-dom';
// import { CookiesProvider } from 'react-cookie';
// import { ConfigProvider } from 'antd';
// import ruRU from 'antd/es/locale/ru_RU';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <CookiesProvider>
//       <BrowserRouter>
//         <ConfigProvider locale={ruRU}>
//           <App />
//         </ConfigProvider>
//       </BrowserRouter>
//     </CookiesProvider>
//   </React.StrictMode>
// );
