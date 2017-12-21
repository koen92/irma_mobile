import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { namespacedTranslation } from 'lib/i18n';

import {
  Footer as NBFooter,
  Button,
  Text,
  Icon,
} from 'native-base';

const t = namespacedTranslation('Session.Footer');

export default class Footer extends Component {

  static propTypes = {
    session: PropTypes.object.isRequired,
    nextStep: PropTypes.func.isRequired,
    navigateBack: PropTypes.func.isRequired,
    sendMail: PropTypes.func.isRequired,
  }

  state = {
    hidden: false
  }

  componentWillReceiveProps(nextProps) {
    // When rendering the footer for a new status, reset the hidden status
    if(this.props.session.status !== nextProps.session.status)
      this.setState({hidden: false});
  }

  press(proceed) {
    const { nextStep } = this.props;
    const success = nextStep(proceed);

    if(success)
      this.setState({hidden: true});
  }

  renderYesNo() {
    const {
      session: {
        irmaAction,
        status,
        toDisclose,
      }
    } = this.props;

    if(!_.includes(['requestPermission', 'requestDisclosurePermission', 'requestPin'], status))
      return null;

    let yesLabel = t('.accept');
    let noLabel = t('.decline');

    if(status === 'requestPermission' && irmaAction === 'issuing' && toDisclose.length > 0)
      yesLabel = t('.next');

    if(status === 'requestPin') {
      yesLabel = t('.submit');
      noLabel = t('.cancel');
    }

    return [
      <Button key="yes" success onPress={() => this.press(true)} >
        <Icon name="checkmark-circle" />
        <Text>{ yesLabel }</Text>
      </Button>,
      <Button key="no" danger onPress={() => this.press(false)} style={{marginLeft: 20}}>
        <Icon name="close-circle" />
        <Text>{ noLabel }</Text>
      </Button>
    ];
  }

  renderDismiss() {
    const { session: { status, result }, navigateBack } = this.props;
    const { hidden } = this.state;

    if(!_.includes(['success', 'failure' , 'cancelled', 'unsatisfiableRequest', 'missingKeyshareEnrollment'], status))
      return null;

    if(hidden)
      return null;

    // Don't render anything for manual session result
    if (status === 'success' && result !== undefined) {
      return null;
    }

    return (
      <Button onPress={navigateBack} >
        <Text>{ t('.dismiss') }</Text>
      </Button>
    );
  }

  renderSendEmail() {
    const { session: { status, result }, navigateBack, sendMail } = this.props;
    if (status === 'success' && result !== undefined) {
      return [
        <Button key="sendMail" success onPress={() => {sendMail(); navigateBack();}} >
          <Icon name="send" />
          <Text>E-mail result</Text>
        </Button>,
        <Button key="dismiss" danger onPress={navigateBack} style={{marginLeft: 20}}>
          <Icon name="close-circle" />
          <Text>{ t('.dismiss') }</Text>
        </Button>
      ];
    }
    return null;
  }

  render() {
    return (
      <NBFooter style={{height: 60, paddingTop: 7}}>
        { this.renderYesNo() }
        { this.renderDismiss() }
        { this.renderSendEmail() }
      </NBFooter>
    );
  }
}
