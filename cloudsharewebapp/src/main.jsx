import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ClerkProvider} from "@clerk/react";

ReactDOM.createRoot(document.getElementById('root')).render(
  <ClerkProvider
    afterSignOutUrl="/"
    appearance={{
      variables: {
        colorPrimary: '#C45E3C',
        colorText: '#3A352F',
        colorBackground: '#FFFEFB',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '0.5rem',
      },
      elements: {
        userButtonAvatarBox: 'ring-2 ring-terracotta/40',
      },
    }}
  >
    <App />
  </ClerkProvider>
)
