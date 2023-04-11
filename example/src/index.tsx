import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { Gleap } from 'capacitor-gleap-plugin';

Gleap.initialize({
  API_KEY: 'KProDXhMS0V3UUku2iNnrZ4XsBnAYzxt',
});

Gleap.setEventCallback((name, data) => {
  console.log("Event Callback", name, data);
});

Gleap.setTags({
  tags: ["tag1", "tag2", "tag3"]
});

Gleap.identify({
  userId: '29382',
  email: "lukas@gleap.io",
  name: "Lukas",
  phone: "123456789",
  value: 100.00,
  customData: {
    "customKey": "Web"
  }
});

Gleap.trackPage({
  pageName: "WebWebWeb",
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
