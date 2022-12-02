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
         Gleap.openNews({
          showBackButton: false,
         });
        }}>Open news</IonButton>
        <IonButton style={{
          marginTop: '12px',
        }} color="primary" onClick={async () => {
         Gleap.openNewsArticle({
          articleId: '6372305f9cc1b60bf5cae22a',
          showBackButton: false,
         });
        }}>Open news article</IonButton>
        <IonButton style={{
          marginTop: '12px',
        }} color="primary" onClick={async () => {
         Gleap.openHelpCenter({
          showBackButton: false,
         });
        }}>Open help center</IonButton>
        <IonButton style={{
          marginTop: '12px',
        }} color="primary" onClick={async () => {
         Gleap.openHelpCenterArticle({
          articleId: '1',
          showBackButton: false,
         });
        }}>Open help center article</IonButton>
        <IonButton style={{
          marginTop: '12px',
        }} color="primary" onClick={async () => {
         Gleap.openHelpCenterCollection({
          collectionId: '4',
          showBackButton: false,
         });
        }}>Open help center collection</IonButton>
        <IonButton style={{
          marginTop: '12px',
        }} color="primary" onClick={async () => {
         Gleap.searchHelpCenter({
          term: "Test",
          showBackButton: false,
         });
        }}>Search help center</IonButton>
      </div>
    </div>
  );
};

export default ExploreContainer;
