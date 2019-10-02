import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Keyboard, KeyboardAvoidingView } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import styled from 'styled-components/primitives';
import { Column } from '../components/layout';
import {
  SendAssetForm,
  SendAssetList,
  SendButton,
  SendContactList,
  SendHeader,
  SendTransactionSpeed,
} from '../components/send';
import { colors } from '../styles';
import { deviceUtils, isNewValueForPath } from '../utils';

const Container = styled(Column)`
  background-color: ${colors.white};
  height: 100%;
`;

export default class SendSheet extends Component {
  static propTypes = {
    allAssets: PropTypes.array,
    assetAmount: PropTypes.string,
    fetchData: PropTypes.func,
    gasPrice: PropTypes.object,
    gasPrices: PropTypes.object,
    isSufficientBalance: PropTypes.bool,
    isSufficientGas: PropTypes.bool,
    isValidAddress: PropTypes.bool,
    nativeCurrencySymbol: PropTypes.string,
    navigation: PropTypes.object,
    onChangeAssetAmount: PropTypes.func,
    onChangeInput: PropTypes.func,
    onChangeNativeAmount: PropTypes.func,
    onLongPressSend: PropTypes.func,
    onPressTransactionSpeed: PropTypes.func,
    onResetAssetSelection: PropTypes.func,
    onSelectAsset: PropTypes.func,
    onUpdateContacts: PropTypes.func,
    recipient: PropTypes.string,
    selected: PropTypes.object,
    sendableUniqueTokens: PropTypes.arrayOf(PropTypes.object),
    sendUpdateRecipient: PropTypes.func,
    sendUpdateSelected: PropTypes.func,
  };

  componentDidUpdate(prevProps) {
    const { isValidAddress, navigation, selected } = this.props;

    if (isValidAddress && !prevProps.isValidAddress) {
      Keyboard.dismiss();
    }

    const isNewSelected = isNewValueForPath(this.props, prevProps, 'selected');
    const isNewValidAddress = isNewValueForPath(
      this.props,
      prevProps,
      'isValidAddress'
    );

    if (isNewValidAddress || isNewSelected) {
      let verticalGestureResponseDistance = 0;

      if (isValidAddress) {
        verticalGestureResponseDistance = isEmpty(selected)
          ? 150
          : deviceUtils.dimensions.height;
      } else {
        verticalGestureResponseDistance = deviceUtils.dimensions.height;
      }

      navigation.setParams({ verticalGestureResponseDistance });
    }
  }

  render() {
    const {
      allAssets,
      contacts,
      currentInput,
      fetchData,
      gasPrice,
      isAuthorizing,
      isValidAddress,
      nativeCurrencySymbol,
      onChangeAssetAmount,
      onChangeInput,
      onChangeNativeAmount,
      onLongPressSend,
      onPressTransactionSpeed,
      onResetAssetSelection,
      onSelectAsset,
      onUpdateContacts,
      recipient,
      selected,
      sendableUniqueTokens,
      sendUpdateRecipient,
      ...props
    } = this.props;
    const showEmptyState = !isValidAddress;
    const showAssetList = isValidAddress && isEmpty(selected);
    const showAssetForm = isValidAddress && !isEmpty(selected);
    console.log(
      'RENDER send sheet show asset list',
      showAssetList,
      isValidAddress,
      selected
    );

    return (
      <Container>
        <KeyboardAvoidingView behavior="padding">
          <Container align="center">
            <SendHeader
              contacts={contacts}
              isValid={isValidAddress}
              isValidAddress={isValidAddress}
              onChangeAddressInput={onChangeInput}
              onPressPaste={sendUpdateRecipient}
              onUpdateContacts={onUpdateContacts}
              recipient={recipient}
            />
            {showEmptyState && (
              <SendContactList
                allAssets={contacts}
                currentInput={currentInput}
                onPressContact={sendUpdateRecipient}
                onUpdateContacts={onUpdateContacts}
              />
            )}
            {showAssetList && (
              <SendAssetList
                allAssets={allAssets}
                fetchData={fetchData}
                onSelectAsset={onSelectAsset}
                uniqueTokens={sendableUniqueTokens}
              />
            )}
            {showAssetForm && (
              <SendAssetForm
                {...props}
                allAssets={allAssets}
                buttonRenderer={
                  <SendButton
                    {...props}
                    isAuthorizing={isAuthorizing}
                    onLongPress={onLongPressSend}
                  />
                }
                onChangeAssetAmount={onChangeAssetAmount}
                onChangeNativeAmount={onChangeNativeAmount}
                onResetAssetSelection={onResetAssetSelection}
                selected={selected}
                txSpeedRenderer={
                  isIphoneX() && (
                    <SendTransactionSpeed
                      gasPrice={gasPrice}
                      nativeCurrencySymbol={nativeCurrencySymbol}
                      onPressTransactionSpeed={onPressTransactionSpeed}
                    />
                  )
                }
              />
            )}
          </Container>
        </KeyboardAvoidingView>
      </Container>
    );
  }
}
