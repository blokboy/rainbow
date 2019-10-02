import analytics from '@segment/analytics-react-native';
import { get, isString, toLower } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { compose, withHandlers } from 'recompact';
import { getLocalContacts } from '../handlers/commonStorage';
import { estimateGasLimit } from '../handlers/web3';
import { greaterThan } from '../helpers/utilities';
import { checkIsValidAddress } from '../helpers/validators';
import {
  withAccountData,
  withAccountSettings,
  withDataInit,
  withGas,
  withSend,
  withUniqueTokens,
} from '../hoc';
import lang from '../languages';
import { ethereumUtils, gasUtils, isNewValueForPath } from '../utils';
import SendSheet from './SendSheet';

class SendSheetWithData extends Component {
  static propTypes = {
    address: PropTypes.string,
    assetAmount: PropTypes.string.isRequired,
    assets: PropTypes.array.isRequired,
    confirm: PropTypes.bool.isRequired,
    fetching: PropTypes.bool.isRequired,
    gasLimit: PropTypes.number,
    gasPrices: PropTypes.object.isRequired,
    gasUpdateDefaultGasLimit: PropTypes.func.isRequired,
    gasUpdateTxFee: PropTypes.func.isRequired,
    isSufficientBalance: PropTypes.bool.isRequired,
    isSufficientGas: PropTypes.bool.isRequired,
    nativeAmount: PropTypes.string.isRequired,
    nativeCurrency: PropTypes.string.isRequired,
    network: PropTypes.string.isRequired,
    recipient: PropTypes.string.isRequired,
    selected: PropTypes.object.isRequired,
    selectedGasPrice: PropTypes.shape({ txFee: PropTypes.object }),
    selectedGasPriceOption: PropTypes.string.isRequired,
    sendClearFields: PropTypes.func.isRequired,
    sendCreatedTransaction: PropTypes.func.isRequired,
    sendMaxBalance: PropTypes.func.isRequired,
    sendModalInit: PropTypes.func.isRequired,
    sendToggleConfirmationView: PropTypes.func.isRequired,
    sendUpdateAssetAmount: PropTypes.func.isRequired,
    sendUpdateNativeAmount: PropTypes.func.isRequired,
    sendUpdateRecipient: PropTypes.func.isRequired,
    sendUpdateSelected: PropTypes.func.isRequired,
    txFees: PropTypes.object.isRequired,
    txHash: PropTypes.string.isRequired,
  };

  static defaultProps = {
    isSufficientBalance: false,
    isSufficientGas: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      currentInput: '',
      isAuthorizing: false,
      isValidAddress: false,
    };
  }

  componentDidMount() {
    this.props.sendModalInit();
    this.props.gasUpdateDefaultGasLimit();

    const { navigation, sendUpdateRecipient } = this.props;
    const address = get(navigation, 'state.params.address');

    if (address) {
      sendUpdateRecipient(address);
    }
    this.onUpdateContacts();
  }

  async componentDidUpdate(prevProps, prevState) {
    console.log('A$ component did update');
    const {
      address,
      assetAmount,
      navigation,
      recipient,
      selected,
      sendUpdateSelected,
    } = this.props;
    const { isValidAddress } = this.state;

    const asset = get(navigation, 'state.params.asset');
    console.log('B$ asset', asset);

    if (isValidAddress && !prevState.isValidAddress) {
      console.log('C$ isValidAddress', isValidAddress);
      if (asset) {
        console.log('D$ isValidAddress asset update');
        sendUpdateSelected(asset);
        console.log('E$ isValidAddress asset updated');
      }
    }

    const isNewRecipient = isNewValueForPath(
      this.props,
      prevProps,
      'recipient'
    );
    console.log(
      'F$ isNewRecip',
      isNewRecipient,
      recipient,
      prevProps.recipient
    );
    if (isNewRecipient) {
      console.log('FG$ is new reci');
      const validAddress = await checkIsValidAddress(recipient);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ isValidAddress: validAddress });
      console.log('G$ isNewRecip valid address', validAddress);
    }

    if (isValidAddress) {
      if (
        selected.symbol !== prevProps.selected.symbol ||
        recipient !== prevProps.recipient ||
        assetAmount !== prevProps.assetAmount
      ) {
        estimateGasLimit({
          address,
          amount: assetAmount,
          asset: selected,
          recipient,
        })
          .then(gasLimit => {
            this.props.gasUpdateTxFee(gasLimit);
          })
          .catch(() => {
            this.props.gasUpdateTxFee(null);
          });
      }
    }
  }

  componentWillUnmount() {
    this.props.sendClearFields();
  }

  onUpdateContacts = async () => {
    const contacts = await getLocalContacts();
    this.setState({ contacts });
  };

  onChangeAssetAmount = assetAmount => {
    if (isString(assetAmount)) {
      this.props.sendUpdateAssetAmount(assetAmount);
      analytics.track('Changed token input in Send flow');
    }
  };

  onChangeNativeAmount = nativeAmount => {
    if (isString(nativeAmount)) {
      this.props.sendUpdateNativeAmount(nativeAmount);
      analytics.track('Changed native currency input in Send flow');
    }
  };

  onLongPressSend = () => {
    this.setState({ isAuthorizing: true });

    if (isIphoneX()) {
      this.submitTransaction();
    } else {
      this.onPressTransactionSpeed(this.submitTransaction);
    }
  };

  onPressTransactionSpeed = onSuccess => {
    const { gasPrices, gasUpdateGasPriceOption, txFees } = this.props;
    gasUtils.showTransactionSpeedOptions(
      gasPrices,
      txFees,
      gasUpdateGasPriceOption,
      onSuccess
    );
  };

  onResetAssetSelection = () => {
    analytics.track('Reset asset selection in Send flow');
    this.props.sendUpdateSelected({});
  };

  onSelectAsset = asset => this.props.sendUpdateSelected(asset);

  submitTransaction = async () => {
    const {
      assetAmount,
      navigation,
      recipient,
      selected,
      sendClearFields,
    } = this.props;

    if (Number(assetAmount) <= 0) return false;

    try {
      await this.onSubmit();
      this.setState({ isAuthorizing: false });
      analytics.track('Sent transaction', {
        assetName: selected.name,
        assetType: selected.isNft ? 'unique_token' : 'token',
        isRecepientENS: toLower(recipient.slice(-4)) === '.eth',
      });
      sendClearFields();
      navigation.navigate('ProfileScreen');
    } catch {
      this.setState({ isAuthorizing: false });
    }
  };

  onChangeInput = event => {
    console.log('A# on change input', event);
    this.setState({ currentInput: event });
    console.log('B# on change input set state');
    this.props.sendUpdateRecipient(event);
    console.log('C# on change input send update recipient');
  };

  onSubmit = async () => {
    if (!this.props.selectedGasPrice.txFee) {
      return;
    }

    // Balance checks
    if (!this.props.confirm) {
      const isAddressValid = await checkIsValidAddress(this.props.recipient);
      if (!isAddressValid) {
        console.log(lang.t('notification.error.invalid_address'));
        return;
      }
      if (this.props.selected.address === 'eth') {
        const {
          requestedAmount,
          balance,
          amountWithFees,
        } = ethereumUtils.transactionData(
          this.props.assets,
          this.props.assetAmount,
          this.props.selectedGasPrice
        );

        if (greaterThan(requestedAmount, balance)) {
          return;
        }
        if (greaterThan(amountWithFees, balance)) {
          return;
        }
      } else if (!this.props.selected.isNft) {
        const {
          requestedAmount,
          balance,
          txFee,
        } = ethereumUtils.transactionData(
          this.props.assets,
          this.props.assetAmount,
          this.props.selectedGasPrice
        );

        const tokenBalance = get(this.props, 'selected.balance.amount');

        if (greaterThan(requestedAmount, tokenBalance)) {
          return;
        }
        if (greaterThan(txFee, balance)) {
          return;
        }
      }

      this.props.sendToggleConfirmationView(true);

      return this.props.sendCreatedTransaction({
        address: this.props.address,
        amount: this.props.assetAmount,
        asset: this.props.selected,
        gasLimit: this.props.gasLimit,
        gasPrice: this.props.selectedGasPrice,
        recipient: this.props.recipient,
      });
    }
  };

  render() {
    console.log('RENDER wdata isValidAdd', this.state.isValidAddress);
    return (
      <SendSheet
        contacts={this.state.contacts}
        currentInput={this.state.currentInput}
        isAuthorizing={this.state.isAuthorizing}
        isValidAddress={this.state.isValidAddress}
        onChangeAssetAmount={this.onChangeAssetAmount}
        onChangeInput={this.onChangeInput}
        onChangeNativeAmount={this.onChangeNativeAmount}
        onLongPressSend={this.onLongPressSend}
        onPressTransactionSpeed={this.onPressTransactionSpeed}
        onResetAssetSelection={this.onResetAssetSelection}
        onSelectAsset={this.onSelectAsset}
        onUpdateContacts={this.onUpdateContacts}
        {...this.props}
      />
    );
  }
}

SendSheetWithData.navigationOptions = ({
  navigation: {
    state: { params },
  },
}) => ({
  gestureResponseDistance: {
    vertical: params && params.verticalGestureResponseDistance,
  },
});

export default compose(
  withAccountSettings,
  withDataInit,
  withSend,
  withGas,
  withAccountData,
  withUniqueTokens,
  withHandlers({
    fetchData: ({ refreshAccountData }) => async () => refreshAccountData(),
  })
)(SendSheetWithData);
