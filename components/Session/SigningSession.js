import React, { Component } from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { namespacedTranslation } from 'lib/i18n';
import PaddedContent from 'lib/PaddedContent';
import KeyboardAwareContainer from 'lib/KeyboardAwareContainer';

import DisclosureChoices from './children/DisclosureChoices';
import Error from './children/Error';
import Footer from './children/Footer';
import Header from './children/Header';
import MissingDisclosures from './children/MissingDisclosures';
import PinEntry from './children/PinEntry';
import StatusCard from './children/StatusCard';

import {
  Text,
  View,
} from 'native-base';

const t = namespacedTranslation('Session.SigningSession');

export default class SigningSession extends Component {

  static propTypes = {
    validationForced: PropTypes.bool.isRequired,
    irmaConfiguration: PropTypes.object.isRequired,
    makeDisclosureChoice: PropTypes.func.isRequired,
    message: PropTypes.string,
    messageType: PropTypes.string,
    navigateBack: PropTypes.func.isRequired,
    sendMail: PropTypes.func.isRequired,
    navigateToEnrollment: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
    pinChange: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
  }

  renderMessageText = () => {
    const {
      session: {
        message,
        messageType,
      }
    } = this.props;

    if (messageType === 'jpg') {
      const image = `data:image/jpeg;base64,${message}`;
      return (
        <Image
          style = {{ flex: 1, width: '90%', aspectRatio: 1, resizeMode: 'contain'}}
          source={{uri: image}}
        />
      );
    }

    return (
      <Text style={{fontWeight: 'bold', paddingLeft: 10}}>
      {'\n'}{ message }
      </Text>
    );
  };

  renderStatusCard() {
    const {
      navigateToEnrollment,
      session,
      session: {
        message,
        messageType,
        serverName,
        status,
        request,
      }
    } = this.props;

    let heading;
    switch(status) {
      case 'success':
      case 'cancelled':
      case 'requestPermission':
        heading = <Text>{ t(`.${status}Heading`) }</Text>;
    }


    let explanation;
    switch(status) {
      case 'unsatisfiableRequest':
        explanation = (
          <Text>
            { t('.unsatisfiableRequestExplanation') }
          </Text>
        );

        break;

      case 'requestPermission': {
        explanation = (
          <View
            style = {{ flex: 1 }}
          >
            <Text>
              { t('.requestPermission.beforeExplanation') }
            </Text>
            <View
              style = {{ justifyContent: 'center' }}
            >
              { this.renderMessageText() }
            </View>
            <Text>{'\n'}{ t('.requestPermission.afterExplanation') }</Text>
          </View>
        );

        break;
      }

      case 'success': {
        explanation = (
          <View
            style = {{ flex: 1, resizeMode: 'contain'}}
          >
            <Text>{ t(`.${status}.beforeExplanation`) }</Text>
            <View
              style = {{ justifyContent: 'center' }}
            >
               { this.renderMessageText() }
            </View>
            <Text>{'\n'}{ t(`.${status}.afterExplanation`) }</Text>
          </View>
        );
      }
    }

    return (
      <StatusCard
        explanation={explanation}
        heading={heading}
        navigateToEnrollment={navigateToEnrollment}
        session={session} />
    );
  }

  renderDisclosures() {
    const { makeDisclosureChoice, session, session: { status } } = this.props;
    // if(status !== 'requestPermission')
    if(!_.includes(['requestPermission', 'success'], status))
      return null;

    return (
      <DisclosureChoices
        hideUnchosen={status === 'success'}
        makeDisclosureChoice={makeDisclosureChoice}
        session={session}
      />
    );
  }

  render() {
    const {
      validationForced,
      navigateBack,
      sendMail,
      nextStep,
      pinChange,
      session,
    } = this.props;

    return (
      <KeyboardAwareContainer>
        <Header title={t('.headerTitle')} navigateBack={navigateBack} />
        <PaddedContent testID="SigningSession" enableAutomaticScroll={session.status !== 'requestPin'}>
          { this.renderStatusCard() }
          <Error session={session} />
          <PinEntry
            session={session}
            validationForced={validationForced}
            pinChange={pinChange}
          />
          <MissingDisclosures session={session} />
          { this.renderDisclosures() }
        </PaddedContent>
        <Footer
          navigateBack={navigateBack}
          sendMail={sendMail}
          nextStep={nextStep}
          session={session}
        />
      </KeyboardAwareContainer>
    );
  }
}
