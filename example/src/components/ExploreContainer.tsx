import './ExploreContainer.css';
import { Gleap } from 'capacitor-gleap-plugin';
import { IonButton } from '@ionic/react';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <div className="container">
      <strong>Ready to create an app?</strong>
      <p>Start with Ionic <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
      <IonButton color="primary" onClick={() => {
        Gleap.open();
      }}>Open Gleap</IonButton>
    </div>
  );
};

export default ExploreContainer;
