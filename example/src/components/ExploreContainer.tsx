import './ExploreContainer.css';
import { Gleap } from 'capacitor-gleap-plugin';
import { IonButton, IonCard, IonCardContent } from '@ionic/react';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <div>
      <IonCard>
        <img src={require('./pexels-pixabay-262353.jpg')} alt="Stacks" />
        <IonCardContent>
          This is content, without any paragraph or header tags,
          within an ion-cardContent element.
        </IonCardContent>
      </IonCard>
      <IonCard>
        <img src={require('./pexels-quintin-gellar-6563903.jpg')} alt="Stacks" />
        <IonCardContent>
          This is content, without any paragraph or header tags,
          within an ion-cardContent element.
        </IonCardContent>
      </IonCard>
      <div className='container'>
        <strong>Ready to create an app?</strong>
        <p>Start with Ionic <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">UI Components</a></p>
        <IonButton style={{
          marginTop: '12px',
        }} color="primary" onClick={async () => {
          const ide = await Gleap.getIdentity();
          const idet = await Gleap.isUserIdentified();
          alert("GetIdent:" + JSON.stringify(ide) + JSON.stringify(idet));
        }}>Open page</IonButton>
        <IonButton style={{
          marginTop: '12px',
        }} color="primary" onClick={async () => {
          Gleap.identify({
            userId: "123456789",
            email: "lukas@gleap.io",
            name: "Lukas",
            value: 192.99,
          });
        }}>Identify</IonButton>
      </div>
    </div>
  );
};

export default ExploreContainer;
