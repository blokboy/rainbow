import {
<<<<<<< HEAD
  tradeEthForExactTokens,
  tradeExactEthForTokens,
  tradeExactTokensForEth,
  tradeExactTokensForTokens,
  tradeTokensForExactEth,
  tradeTokensForExactTokens,
} from '@uniswap/sdk';
import {
  filter,
  findIndex,
  get,
  isNil,
  keys,
  map,
} from 'lodash';
=======
  tradeEthForExactTokensWithData,
  tradeExactEthForTokensWithData,
  tradeExactTokensForEthWithData,
  tradeExactTokensForTokensWithData,
  tradeTokensForExactEthWithData,
  tradeTokensForExactTokensWithData,
} from '@uniswap/sdk';
import BigNumber from 'bignumber.js';
import { get, isNil } from 'lodash';
>>>>>>> origin/develop
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { InteractionManager, LayoutAnimation, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
<<<<<<< HEAD
import { NavigationActions, NavigationEvents, withNavigationFocus } from 'react-navigation';
import { compose, mapProps, toClass, withProps } from 'recompact';
import { executeSwap } from '../handlers/uniswap';
import {
  convertAmountFromNativeValue,
  convertAmountToNativeAmount,
  convertAmountToRawAmount,
  convertRawAmountToDecimalFormat,
  subtract,
=======
import { NavigationEvents, withNavigationFocus } from 'react-navigation';
import { compose, mapProps, toClass } from 'recompact';
import { estimateSwapGasLimit, executeSwap } from '../handlers/uniswap';
import {
  convertAmountFromNativeValue,
  convertAmountToNativeAmount,
  convertAmountToNativeDisplay,
  convertAmountToRawAmount,
  convertRawAmountToDecimalFormat,
  greaterThan,
  subtract,
  updatePrecisionToDisplay,
>>>>>>> origin/develop
} from '../helpers/utilities';
import {
  withAccountAddress,
  withAccountData,
  withAccountSettings,
  withBlockedHorizontalSwipe,
<<<<<<< HEAD
  withKeyboardFocusHistory,
  withTransactionConfirmationScreen,
  withTransitionProps,
} from '../hoc';
import { colors, padding, position } from '../styles';
import { deviceUtils, ethereumUtils, safeAreaInsetValues } from '../utils';
import {
  ConfirmExchangeButton,
  ExchangeGasFeeButton,
=======
  withGas,
  withKeyboardFocusHistory,
  withTransactionConfirmationScreen,
  withTransitionProps,
  withUniswapAllowances,
  withUniswapAssets,
} from '../hoc';
import { colors, padding, position } from '../styles';
import {
  contractUtils,
  ethereumUtils,
  gasUtils,
  isNewValueForPath,
} from '../utils';
import {
  ConfirmExchangeButton,
>>>>>>> origin/develop
  ExchangeInputField,
  ExchangeModalHeader,
  ExchangeOutputField,
  SlippageWarning,
} from '../components/exchange';
import { FloatingPanel, FloatingPanels } from '../components/expanded-state';
<<<<<<< HEAD
=======
import { GasSpeedButton } from '../components/gas';
>>>>>>> origin/develop
import GestureBlocker from '../components/GestureBlocker';
import {
  Centered,
  Column,
  KeyboardFixedOpenLayout,
} from '../components/layout';
<<<<<<< HEAD
import { Text } from '../components/text';
=======
>>>>>>> origin/develop
import { CurrencySelectionTypes } from './CurrencySelectModal';

export const exchangeModalBorderRadius = 30;

const AnimatedFloatingPanels = Animated.createAnimatedComponent(toClass(FloatingPanels));

const isSameAsset = (firstAsset, secondAsset) => {
  if (!firstAsset || !secondAsset) {
    return false;
  }

  const firstAddress = get(firstAsset, 'address', '').toLowerCase();
<<<<<<< HEAD
  const secondAddress = get(firstAsset, 'address', '').toLowerCase();
  return firstAddress === secondAddress;
}

class ExchangeModal extends PureComponent {
  static propTypes = {
    allAssets: PropTypes.array,
    chainId: PropTypes.number,
    clearKeyboardFocusHistory: PropTypes.func,
    dataAddNewTransaction: PropTypes.func,
=======
  const secondAddress = get(secondAsset, 'address', '').toLowerCase();
  return firstAddress === secondAddress;
};

class ExchangeModal extends PureComponent {
  static propTypes = {
    accountAddress: PropTypes.string,
    allAssets: PropTypes.array,
    allowances: PropTypes.object,
    chainId: PropTypes.number,
    clearKeyboardFocusHistory: PropTypes.func,
    dataAddNewTransaction: PropTypes.func,
    gasLimit: PropTypes.string,
    gasPrices: PropTypes.object,
    gasUpdateGasPriceOption: PropTypes.string,
    gasUpdateTxFee: PropTypes.func,
    isFocused: PropTypes.bool,
    isTransitioning: PropTypes.bool,
>>>>>>> origin/develop
    keyboardFocusHistory: PropTypes.array,
    nativeCurrency: PropTypes.string,
    navigation: PropTypes.object,
    pushKeyboardFocusHistory: PropTypes.func,
<<<<<<< HEAD
    tradeDetails: PropTypes.object,
  }

  state = {
    inputAmount: null,
    inputAsExactAmount: false,
    inputCurrency: ethereumUtils.getAsset(this.props.allAssets),
    nativeAmount: null,
    outputAmount: null,
    outputCurrency: null,
=======
    resetGasTxFees: PropTypes.func,
    selectedGasPrice: PropTypes.object,
    tokenReserves: PropTypes.array,
    tradeDetails: PropTypes.object,
    transitionPosition: PropTypes.object, // animated value
    txFees: PropTypes.object,
    uniswapGetTokenReserve: PropTypes.func,
    uniswapUpdateAllowances: PropTypes.func,
  }

  state = {
    inputAllowance: null,
    inputAmount: null,
    inputAmountDisplay: null,
    inputAsExactAmount: false,
    inputCurrency: ethereumUtils.getAsset(this.props.allAssets),
    inputExecutionRate: null,
    inputNativePrice: null,
    isAssetApproved: true,
    isSufficientBalance: true,
    isUnlockingAsset: false,
    nativeAmount: null,
    outputAmount: null,
    outputAmountDisplay: null,
    outputCurrency: null,
    outputExecutionRate: null,
    outputNativePrice: null,
>>>>>>> origin/develop
    showConfirmButton: false,
    slippage: null,
    tradeDetails: null,
  }

<<<<<<< HEAD
  componentDidUpdate = (prevProps) => {
    const { isFocused, isTransitioning, keyboardFocusHistory} = this.props;
    const { inputAmount, outputAmount, outputCurrency } = this.state;

    if (isFocused && (!isTransitioning && prevProps.isTransitioning)) {
      const lastFocusedInput = keyboardFocusHistory[keyboardFocusHistory.length - 2];
=======
  componentDidUpdate = (prevProps, prevState) => {
    const {
      isFocused,
      isTransitioning,
      keyboardFocusHistory,
    } = this.props;

    if (isFocused && (!isTransitioning && prevProps.isTransitioning)) {
      const lastFocusedInput = keyboardFocusHistory[keyboardFocusHistory.length - 1];
>>>>>>> origin/develop

      if (lastFocusedInput) {
        InteractionManager.runAfterInteractions(() => {
          TextInput.State.focusTextInput(lastFocusedInput);
        });
      } else {
        // console.log('ELSE')
        // this.inputFieldRef.focus();
      }
    }

<<<<<<< HEAD
    if (inputAmount || outputAmount) {
      LayoutAnimation.easeInEaseOut();
    }

    if (outputCurrency) {
      console.log('should showConfirmButton');
      this.setState({ showConfirmButton: true });
=======
    if (this.state.outputCurrency) {
      this.setState({ showConfirmButton: true });
    }

    const isNewInputAmount = isNewValueForPath(this.state, prevState, 'inputAmount');
    const isNewOutputAmount = isNewValueForPath(this.state, prevState, 'outputAmount');

    const isNewNativeAmount = (
      // Only consider 'new' if the native input isnt focused,
      // otherwise itll fight with the user's keystrokes
      isNewValueForPath(this.state, prevState, 'nativeAmount')
      && this.nativeFieldRef.isFocused()
    );

    const isNewInputCurrency = isNewValueForPath(this.state, prevState, 'inputCurrency.uniqueId');
    const isNewOutputCurrency = isNewValueForPath(this.state, prevState, 'outputCurrency.uniqueId');

    const isNewAmount = isNewNativeAmount || isNewInputAmount || isNewOutputAmount;
    const isNewCurrency = isNewInputCurrency || isNewOutputCurrency;

    if (isNewAmount || isNewCurrency) {
      this.getMarketDetails();
      LayoutAnimation.easeInEaseOut();
    }

    if (isNewValueForPath(this.state, prevState, 'inputCurrency.address')) {
      this.getCurrencyAllowance();
>>>>>>> origin/develop
    }
  }

  componentWillUnmount = () => {
<<<<<<< HEAD
    this.props.clearKeyboardFocusHistory();
  }

  inputFieldRef = null

  nativeFieldRef = null

  outputFieldRef = null

  parseTradeDetails = (path, tradeDetails, decimals) => {
    const updatedValue = get(tradeDetails, path);
    const slippage = get(tradeDetails, 'marketRateSlippage');
    const rawUpdatedValue = convertRawAmountToDecimalFormat(updatedValue, decimals);
    return { rawUpdatedValue, slippage: slippage.toFixed() };
  };

  getMarketDetails = async () => {
    try {
      let tradeDetails = null;
      const { chainId } = this.props;
      const {
        inputAmount,
        inputAsExactAmount,
        inputCurrency,
        outputAmount,
        outputCurrency,
      } = this.state;
      if (inputCurrency === null || outputCurrency === null) return;
      if (isNil(inputAmount) && isNil(outputAmount)) return;
      const {
        address: inputCurrencyAddress,
        decimals: inputDecimals,
      } = inputCurrency;
      const {
        address: outputCurrencyAddress,
        decimals: outputDecimals,
      } = outputCurrency;
      const rawInputAmount = convertAmountToRawAmount(inputAmount || 0, inputDecimals);
      const rawOutputAmount = convertAmountToRawAmount(outputAmount || 0, outputDecimals);

      if (inputCurrencyAddress === 'eth' && outputCurrencyAddress !== 'eth') {
        tradeDetails = inputAsExactAmount
          ? await tradeExactEthForTokens(outputCurrencyAddress, rawInputAmount, chainId)
          : await tradeEthForExactTokens(outputCurrencyAddress, rawOutputAmount, chainId);
      } else if (inputCurrencyAddress !== 'eth' && outputCurrencyAddress === 'eth') {
        tradeDetails = inputAsExactAmount
          ? await tradeExactTokensForEth(inputCurrencyAddress, rawInputAmount, chainId)
          : await tradeTokensForExactEth(inputCurrencyAddress, rawOutputAmount, chainId);
      } else if (inputCurrencyAddress !== 'eth' && outputCurrencyAddress !== 'eth') {
        tradeDetails = inputAsExactAmount
          ? await tradeExactTokensForTokens(inputCurrencyAddress, outputCurrencyAddress, rawInputAmount, chainId)
          : await tradeTokensForExactTokens(inputCurrencyAddress, outputCurrencyAddress, rawOutputAmount, chainId);
      }
      const decimals = inputAsExactAmount ? outputDecimals : inputDecimals;
      const path = inputAsExactAmount ? 'outputAmount.amount' : 'inputAmount.amount';
      this.setState({ tradeDetails });
      const { rawUpdatedValue, slippage } = this.parseTradeDetails(path, tradeDetails, decimals);
      if (inputAsExactAmount) {
        this.setState({ outputAmount: rawUpdatedValue, slippage });
      } else {
        this.setState({ inputAmount: rawUpdatedValue, slippage });
      }
    } catch (error) {
      console.log('error getting market details', error);
      // TODO
    }
  }

  setInputAsExactAmount = (inputAsExactAmount) => this.setState({ inputAsExactAmount })

  setNativeAmount = async (nativeAmount) => {
    this.setState({ nativeAmount });
    const nativePrice = get(this.state.inputCurrency, 'native.price.amount', 0);
    this.setState({ inputAmount: convertAmountFromNativeValue(nativeAmount, nativePrice) });
    this.setInputAsExactAmount(true);
    await this.getMarketDetails();
  }

  setInputAmount = async (inputAmount) => {
    this.setState({ inputAmount });

    let newNativeAmount = null;
    if (inputAmount) {
      const nativePrice = get(this.state.inputCurrency, 'native.price.amount', 0);
      newNativeAmount = convertAmountToNativeAmount(inputAmount, nativePrice);
    }

    this.setState({ nativeAmount: newNativeAmount });
    this.setInputAsExactAmount(true);
    await this.getMarketDetails();
  }

  setOutputAmount = async (outputAmount) => {
    this.setState({ outputAmount });
    this.setInputAsExactAmount(false);
    await this.getMarketDetails();
  }

  setInputCurrency = (inputCurrencySelection, force) => {
    const { inputCurrency, outputCurrency } = this.state;

    this.setState({ inputCurrency: inputCurrencySelection });

    if (!force && isSameAsset(inputCurrency, outputCurrency)) {
      if (outputCurrency !== null && inputCurrency !== null) {
        return this.setOutputCurrency(null, true);
      }

      return this.setOutputCurrency(inputCurrency, true);
    }
  }

  setOutputCurrency = (outputCurrency, force) => {
    const { allAssets } = this.props;
    const { inputCurrency } = this.state;

    this.setState({ outputCurrency });

    if (!force && isSameAsset(inputCurrency, outputCurrency)) {
      const asset = ethereumUtils.getAsset(allAssets, outputCurrency.address.toLowerCase());

      console.log('asset', asset);
      //
      if (inputCurrency !== null && outputCurrency !== null && !isNil(asset)) {
        this.setInputCurrency(null, true);
      } else {
        this.setInputCurrency(outputCurrency, true);
      }
    }
  }

  onPressMaxBalance = () => {
    const { inputCurrency } = this.state;
    const balance = get(inputCurrency, 'balance.amount', 0);
    const inputAmount = (inputCurrency.address === 'eth') ? subtract(balance, 0.01) : balance;
    this.setState({ inputAmount });
  }

  handleSelectInputCurrency = () => {
    this.props.navigation.navigate('CurrencySelectScreen', {
      type: CurrencySelectionTypes.input,
      onSelectCurrency: this.setInputCurrency,
    });
  }

  handleSelectOutputCurrency = () => {
    this.props.navigation.navigate('CurrencySelectScreen', {
      type: CurrencySelectionTypes.output,
      onSelectCurrency: this.setOutputCurrency,
    });
  }

  handleSubmit = async () => {
    const { accountAddress, dataAddNewTransaction, navigation } = this.props;
    const { inputAmount, inputCurrency, tradeDetails } = this.state;

    try {
      const txn = await executeSwap(tradeDetails);
=======
    this.props.resetGasTxFees();
    this.props.clearKeyboardFocusHistory();
  }

  /* eslint-disable lines-between-class-members */
  inputFieldRef = null
  nativeFieldRef = null
  outputFieldRef = null

  assignInputFieldRef = (ref) => { this.inputFieldRef = ref; }
  assignNativeFieldRef = (ref) => { this.nativeFieldRef = ref; }
  assignOutputFieldRef = (ref) => { this.outputFieldRef = ref; }
  /* eslint-enable lines-between-class-members */

  clearForm = () => {
    if (this.inputFieldRef) this.inputFieldRef.clear();
    if (this.nativeFieldRef) this.nativeFieldRef.clear();
    if (this.outputFieldRef) this.outputFieldRef.clear();
  }

  getCurrencyAllowance = async () => {
    const { accountAddress, allowances, uniswapUpdateAllowances } = this.props;
    const { inputCurrency } = this.state;
    const { address: inputAddress, exchangeAddress } = inputCurrency;

    if (inputAddress === 'eth') {
      return this.setState({ isAssetApproved: true });
    }

    let allowance = allowances[inputAddress];
    if (!allowance) {
      allowance = await contractUtils.getAllowance(accountAddress, inputCurrency, exchangeAddress);
      uniswapUpdateAllowances(inputAddress, allowance);
    }
    const isAssetApproved = greaterThan(allowance, 0);
    if (isAssetApproved) {
      return this.setState({ isAssetApproved });
    }
    try {
      const gasLimit = await contractUtils.estimateApprove(inputCurrency.address, exchangeAddress);
      return this.setState({ gasLimit: gasLimit.toFixed(), isAssetApproved });
    } catch (error) {
      return this.setState({ isAssetApproved });
    }
  }

  getMarketDetails = async () => {
    const { chainId, gasUpdateTxFee, nativeCurrency } = this.props;
    const {
      inputAmount,
      inputAsExactAmount,
      inputCurrency,
      isAssetApproved,
      nativeAmount,
      outputAmount,
      outputCurrency,
    } = this.state;

    const isMissingAmounts = !inputAmount && !outputAmount;
    const isMissingCurrency = !inputCurrency || !outputCurrency;
    if (isMissingAmounts || isMissingCurrency) {
      return;
    }

    try {
      const {
        address: inputAddress,
        balance: { amount: inputBalance },
        decimals: inputDecimals,
      } = inputCurrency;
      const {
        address: outputAddress,
        decimals: outputDecimals,
      } = outputCurrency;

      const isInputEth = inputAddress === 'eth';
      const isOutputEth = outputAddress === 'eth';

      const inputReserve = await this.getReserveData(inputAddress);
      const outputReserve = await this.getReserveData(outputAddress);

      const rawInputAmount = convertAmountToRawAmount(inputAmount || 0, inputDecimals);
      const rawOutputAmount = convertAmountToRawAmount(outputAmount || 0, outputDecimals);

      let tradeDetails = null;

      if (isInputEth && !isOutputEth) {
        tradeDetails = inputAsExactAmount
          ? tradeExactEthForTokensWithData(outputReserve, rawInputAmount, chainId)
          : tradeEthForExactTokensWithData(outputReserve, rawOutputAmount, chainId);
      } else if (!isInputEth && isOutputEth) {
        tradeDetails = inputAsExactAmount
          ? tradeExactTokensForEthWithData(inputReserve, rawInputAmount, chainId)
          : tradeTokensForExactEthWithData(inputReserve, rawOutputAmount, chainId);
      } else if (!isInputEth && !isOutputEth) {
        tradeDetails = inputAsExactAmount
          ? tradeExactTokensForTokensWithData(inputReserve, outputReserve, rawInputAmount, chainId)
          : tradeTokensForExactTokensWithData(inputReserve, outputReserve, rawOutputAmount, chainId);
      }

      let inputExecutionRate = '';
      let outputExecutionRate = '';
      let inputNativePrice = '';
      let outputNativePrice = '';

      if (inputCurrency) {
        const inputPriceValue = get(inputCurrency, 'price.value', 0);
        inputExecutionRate = updatePrecisionToDisplay(
          get(tradeDetails, 'executionRate.rate', BigNumber(0)),
          inputPriceValue,
        );

        inputNativePrice = convertAmountToNativeDisplay(
          inputPriceValue,
          nativeCurrency,
        );
      }

      if (outputCurrency) {
        const outputPriceValue = get(outputCurrency, 'price.value', 0);
        outputExecutionRate = updatePrecisionToDisplay(
          get(tradeDetails, 'executionRate.rateInverted', BigNumber(0)),
          outputPriceValue,
        );

        outputNativePrice = convertAmountToNativeDisplay(
          outputPriceValue,
          nativeCurrency,
        );
      }

      const slippage = get(tradeDetails, 'marketRateSlippage', 0).toFixed();

      this.setState({
        inputExecutionRate,
        inputNativePrice,
        isSufficientBalance: Number(inputBalance) >= Number(inputAmount),
        outputExecutionRate,
        outputNativePrice,
        slippage,
        tradeDetails,
      });

      const isInputZero = Number(rawInputAmount) === 0;
      const isNativeZero = Number(nativeAmount || 0) === 0;
      const isOutputZero = Number(rawOutputAmount) === 0;

      if (this.nativeFieldRef.isFocused() && isNativeZero) {
        this.clearForm();
      }

      if (inputAsExactAmount && !this.outputFieldRef.isFocused()) {
        if (isInputZero) {
          this.clearForm();
        } else {
          const updatedAmount = get(tradeDetails, 'outputAmount.amount');
          const rawUpdatedAmount = convertRawAmountToDecimalFormat(updatedAmount, outputDecimals);

          const updatedAmountDisplay = updatePrecisionToDisplay(
            rawUpdatedAmount,
            get(outputCurrency, 'price.value'),
          );

          this.setOutputAmount(rawUpdatedAmount, updatedAmountDisplay);
        }
      }

      if (!inputAsExactAmount && !this.inputFieldRef.isFocused()) {
        if (isOutputZero) {
          this.clearForm();
        } else {
          const updatedAmount = get(tradeDetails, 'inputAmount.amount');
          const rawUpdatedAmount = convertRawAmountToDecimalFormat(updatedAmount, inputDecimals);

          const updatedAmountDisplay = updatePrecisionToDisplay(
            rawUpdatedAmount,
            get(inputCurrency, 'price.value'),
          );

          this.setInputAmount(rawUpdatedAmount, updatedAmountDisplay);
        }
      }
      if (isAssetApproved) {
        const gasLimit = await estimateSwapGasLimit(tradeDetails);
        if (gasLimit) {
          gasUpdateTxFee(gasLimit.toString());
        }
      }
    } catch (error) {
      console.log('error getting market details', error);
      // TODO error state
    }
  }

  getReserveData = async (tokenAddress) => {
    if (tokenAddress === 'eth') return null;

    const { tokenReserves, uniswapGetTokenReserve } = this.props;

    let reserve = tokenReserves[tokenAddress.toLowerCase()];
    if (!reserve) {
      reserve = await uniswapGetTokenReserve(tokenAddress);
    }

    return reserve;
  }

  handlePressMaxBalance = () => {
    const { inputCurrency } = this.state;
    let maxBalance = get(inputCurrency, 'balance.amount', 0);
    if (inputCurrency.address === 'eth') {
      maxBalance = subtract(maxBalance, 0.01);
    }

    return this.setInputAmount(maxBalance);
  }

  handlePressTransactionSpeed = () => {
    const {
      gasPrices,
      gasUpdateGasPriceOption,
      txFees,
    } = this.props;

    gasUtils.showTransactionSpeedOptions(gasPrices, txFees, gasUpdateGasPriceOption);
  }

  handleSubmit = async () => {
    const {
      accountAddress,
      dataAddNewTransaction,
      gasLimit,
      navigation,
    } = this.props;
    const { inputAmount, inputCurrency, tradeDetails } = this.state;

    try {
      const txn = await executeSwap(tradeDetails, gasLimit);
>>>>>>> origin/develop
      if (txn) {
        dataAddNewTransaction({
          amount: inputAmount,
          asset: inputCurrency,
          from: accountAddress,
          hash: txn.hash,
          nonce: get(txn, 'nonce'),
          to: get(txn, 'to'),
        });
      }
      navigation.navigate('ProfileScreen');
    } catch (error) {
      console.log('error submitting swap', error);
      navigation.navigate('WalletScreen');
    }
  }

  handleWillFocus = ({ lastState }) => {
    if (!lastState && this.inputFieldRef) {
<<<<<<< HEAD
      return this.inputFieldRef.focus();
    }
  }

  handleInputFieldRef = (ref) => { this.inputFieldRef = ref; }

  handleNativeFieldRef = (ref) => { this.nativeFieldRef = ref; }

  handleOutputFieldRef = (ref) => { this.outputFieldRef = ref; }

  handleDidFocus = () => {
    // console.log('DID FOCUS', this.props.navigation)

    // if (this.inputFieldRef) {
    //   setTimeout(() => this.inputFieldRef.focus(), 250);
    // }
=======
      this.inputFieldRef.focus();
    }
  }

  handleDidFocus = () => {
    // console.log('DID FOCUS', this.props.navigation)
>>>>>>> origin/develop
  }

  handleFocusField = ({ currentTarget }) => {
    this.props.pushKeyboardFocusHistory(currentTarget);
  }

<<<<<<< HEAD
  render = () => {
    const {
      keyboardFocusHistory,
      nativeCurrency,
      navigation,
      onPressConfirmExchange,
      transitionPosition,
    } = this.props;

    const {
      inputAmount,
      inputCurrency,
      nativeAmount,
      outputAmount,
      outputCurrency,
=======
  handleUnlockAsset = async () => {
    /*
    const {
      inputCurrency: {
        address: tokenAddress,
        exchangeAddress: spender,
      },
    } = this.state;
    */

    // const approval = await contractUtils.approve(tokenAddress, spender);

    this.setState({ isUnlockingAsset: true });
  }

  navigateToSelectInputCurrency = () => {
    this.props.navigation.navigate('CurrencySelectScreen', {
      onSelectCurrency: this.setInputCurrency,
      type: CurrencySelectionTypes.input,
    });
  }

  navigateToSelectOutputCurrency = () => {
    this.props.navigation.navigate('CurrencySelectScreen', {
      onSelectCurrency: this.setOutputCurrency,
      type: CurrencySelectionTypes.output,
    });
  }

  setInputAmount = (inputAmount, amountDisplay) => {
    this.setState(({ inputCurrency }) => {
      const newState = {
        inputAmount,
        inputAmountDisplay: amountDisplay !== undefined ? amountDisplay : inputAmount,
        inputAsExactAmount: true,
      };

      if (!this.nativeFieldRef.isFocused()) {
        let nativeAmount = null;

        if (inputAmount) {
          const nativePrice = get(inputCurrency, 'native.price.amount', 0);
          nativeAmount = convertAmountToNativeAmount(inputAmount, nativePrice);
        }

        newState.nativeAmount = nativeAmount;
      }

      return newState;
    });
  }

  setInputCurrency = (inputCurrency, force) => {
    const { outputCurrency } = this.state;

    this.setState({ inputCurrency });

    if (!force && isSameAsset(inputCurrency, outputCurrency)) {
      if (!isNil(inputCurrency) && !isNil(outputCurrency)) {
        this.setOutputCurrency(null, true);
      } else {
        this.setOutputCurrency(inputCurrency, true);
      }
    }
  }

  setNativeAmount = (nativeAmount) => {
    this.setState(({ inputCurrency }) => {
      let inputAmount = null;
      let inputAmountDisplay = null;

      if (nativeAmount) {
        const nativePrice = get(inputCurrency, 'native.price.amount', 0);
        inputAmount = convertAmountFromNativeValue(nativeAmount, nativePrice);
        inputAmountDisplay = updatePrecisionToDisplay(inputAmount, get(inputCurrency, 'price.value'));
      }

      return {
        inputAmount,
        inputAmountDisplay,
        inputAsExactAmount: true,
        nativeAmount,
      };
    });
  }

  setOutputAmount = (outputAmount, amountDisplay) => {
    this.setState(({ outputCurrency }) => ({
      inputAsExactAmount: false,
      outputAmount,
      outputAmountDisplay: amountDisplay !== undefined ? amountDisplay : outputAmount,
    }));
  }

  setOutputCurrency = (outputCurrency, force) => {
    const { allAssets } = this.props;
    const { inputCurrency } = this.state;

    this.setState({ outputCurrency });

    if (!force && isSameAsset(inputCurrency, outputCurrency)) {
      const outputAddress = outputCurrency.address.toLowerCase();
      const asset = ethereumUtils.getAsset(allAssets, outputAddress);

      if (!isNil(asset) && !isNil(inputCurrency) && !isNil(outputCurrency)) {
        this.setInputCurrency(null, true);
      } else {
        this.setInputCurrency(outputCurrency, true);
      }
    }
  }

  render = () => {
    const { nativeCurrency, transitionPosition } = this.props;

    const {
      inputAmountDisplay,
      inputCurrency,
      // inputExecutionRate,
      // inputNativePrice,
      isAssetApproved,
      isSufficientBalance,
      isUnlockingAsset,
      nativeAmount,
      outputAmountDisplay,
      outputCurrency,
      // outputExecutionRate,
      // outputNativePrice,
>>>>>>> origin/develop
      showConfirmButton,
      slippage,
    } = this.state;

    return (
      <KeyboardFixedOpenLayout>
        <NavigationEvents
          onDidFocus={this.handleDidFocus}
          onWillFocus={this.handleWillFocus}
        />
        <Centered
          {...position.sizeAsObject('100%')}
          backgroundColor={colors.transparent}
          direction="column"
        >
          <AnimatedFloatingPanels
            margin={0}
            style={{
              opacity: Animated.interpolate(transitionPosition, {
                extrapolate: 'clamp',
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            }}
          >
<<<<<<< HEAD
            <GestureBlocker type='top'/>
            <FloatingPanel radius={exchangeModalBorderRadius}>
              <ExchangeModalHeader />
              <Column align="center" flex={0}>
                <ExchangeInputField
                  inputAmount={inputAmount}
                  inputCurrency={get(inputCurrency, 'symbol', null)}
                  inputFieldRef={this.handleInputFieldRef}
                  nativeAmount={nativeAmount}
                  nativeCurrency={nativeCurrency}
                  nativeFieldRef={this.handleNativeFieldRef}
                  onFocus={this.handleFocusField}
                  onPressMaxBalance={this.onPressMaxBalance}
                  onPressSelectInputCurrency={this.handleSelectInputCurrency}
                  setInputAmount={this.setInputAmount}
                  setNativeAmount={this.setNativeAmount}
                />
                <ExchangeOutputField
                  onPressSelectOutputCurrency={this.handleSelectOutputCurrency}
                  outputAmount={outputAmount}
                  onFocus={this.handleFocusField}
                  outputCurrency={get(outputCurrency, 'symbol', null)}
                  outputFieldRef={this.handleOutputFieldRef}
                  setOutputAmount={this.setOutputAmount}
                />
              </Column>
            </FloatingPanel>
            <SlippageWarning slippage={slippage} />
=======
            <FloatingPanel radius={exchangeModalBorderRadius} overflow='visible'>
              <GestureBlocker type='top'/>
              <ExchangeModalHeader />
              <ExchangeInputField
                inputAmount={inputAmountDisplay}
                inputCurrencySymbol={get(inputCurrency, 'symbol', null)}
                inputFieldRef={this.assignInputFieldRef}
                isAssetApproved={isAssetApproved}
                isUnlockingAsset={isUnlockingAsset}
                nativeAmount={nativeAmount}
                nativeCurrency={nativeCurrency}
                nativeFieldRef={this.assignNativeFieldRef}
                onFocus={this.handleFocusField}
                onPressMaxBalance={this.handlePressMaxBalance}
                onPressSelectInputCurrency={this.navigateToSelectInputCurrency}
                onUnlockAsset={this.handleUnlockAsset}
                setInputAmount={this.setInputAmount}
                setNativeAmount={this.setNativeAmount}
              />
              <ExchangeOutputField
                onFocus={this.handleFocusField}
                onPressSelectOutputCurrency={this.navigateToSelectOutputCurrency}
                outputAmount={outputAmountDisplay}
                outputCurrency={get(outputCurrency, 'symbol', null)}
                outputFieldRef={this.assignOutputFieldRef}
                setOutputAmount={this.setOutputAmount}
                bottomRadius={exchangeModalBorderRadius}
              />
            </FloatingPanel>
            {isSufficientBalance && <SlippageWarning slippage={slippage} />}
>>>>>>> origin/develop
            {showConfirmButton && (
              <Fragment>
                <Centered
                  css={padding(19, 15, 0)}
                  flexShrink={0}
                  width="100%"
                >
                  <ConfirmExchangeButton
<<<<<<< HEAD
                    disabled={!Number(inputAmount)}
                    onPress={this.handleSubmit}
                  />
                </Centered>
                <ExchangeGasFeeButton
                  gasPrice={'$0.06'}
                />
              </Fragment>
            )}
            <GestureBlocker type='bottom'/>
=======
                    disabled={isAssetApproved && !Number(inputAmountDisplay)}
                    inputCurrencyName={get(inputCurrency, 'symbol')}
                    isAssetApproved={isAssetApproved}
                    isSufficientBalance={isSufficientBalance}
                    isUnlockingAsset={isUnlockingAsset}
                    onSubmit={this.handleSubmit}
                    onUnlockAsset={this.handleUnlockAsset}
                    slippage={slippage}
                  />
                </Centered>
                <GasSpeedButton />
              </Fragment>
            )}
            <Column>
              <GestureBlocker type='bottom'/>
            </Column>
>>>>>>> origin/develop
          </AnimatedFloatingPanels>
        </Centered>
      </KeyboardFixedOpenLayout>
    );
  }
}

<<<<<<< HEAD
const withMockedPrices = withProps({
  currencyToDollar: 3,
  targetCurrencyToDollar: 2,
});

=======
>>>>>>> origin/develop
export default compose(
  withAccountAddress,
  withAccountData,
  withAccountSettings,
  withBlockedHorizontalSwipe,
<<<<<<< HEAD
  withKeyboardFocusHistory,
  withMockedPrices,
  withNavigationFocus,
  withTransactionConfirmationScreen,
  withTransitionProps,
  mapProps(({
    navigation,
    tabsTransitionProps: {
      isTransitioning: isTabsTransitioning,
    },
    stackTransitionProps: {
      isTransitioning:  isStacksTransitioning,
    },
    ...props,
=======
  withGas,
  withKeyboardFocusHistory,
  withNavigationFocus,
  withTransactionConfirmationScreen,
  withTransitionProps,
  withUniswapAllowances,
  withUniswapAssets,
  mapProps(({
    navigation,
    stackTransitionProps: {
      isTransitioning: isStacksTransitioning,
    },
    tabsTransitionProps: {
      isTransitioning: isTabsTransitioning,
    },
    ...props
>>>>>>> origin/develop
  }) => ({
    ...props,
    isTransitioning: isStacksTransitioning || isTabsTransitioning,
    navigation,
    transitionPosition: get(navigation, 'state.params.position'),
  })),
)(ExchangeModal);
