import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { InteractionManager } from 'react-native';
import {
  compose,
  onlyUpdateForKeys,
  withHandlers,
  withProps,
} from 'recompact';
import styled from 'styled-components/primitives';
import { withAccountData, withAccountSettings } from '../../hoc';
import { ethereumUtils } from '../../utils';
import { AssetPanel } from './asset-panel';
import FloatingPanels from './FloatingPanels';
import ValueChart from '../value-chart/ValueChart';
import { BalanceCoinRow } from '../coin-row';
import BottomSendButtons from '../value-chart/BottomSendButtons';

const ChartContainer = styled.View`
  height: 380px;
  border-radius: 20;
  justify-content: center;
  align-items: center;
`;

const BottomContainer = styled.View`
  padding-bottom: 20px;
`;

const TokenExpandedState = ({
  onPressSend,
  onPressSwap,
  change,
  changeDirection,
  price,
  subtitle,
  selectedAsset,
  title,
}) => (
  <FloatingPanels>
    <AssetPanel>
      <ChartContainer>
        <ValueChart
          change={change}
          changeDirection={changeDirection}
        />
      </ChartContainer>
      <BottomContainer>
        <BalanceCoinRow {...selectedAsset}></BalanceCoinRow>
        <BottomSendButtons
          onPressSend={onPressSend}
          onPressSwap={onPressSwap}
        />
      </BottomContainer>
    </AssetPanel>
  </FloatingPanels>
);

TokenExpandedState.propTypes = {
  change: PropTypes.string,
  changeDirection: PropTypes.bool,
  onPressSend: PropTypes.func,
  onPressSwap: PropTypes.func,
  price: PropTypes.string,
  selectedAsset: PropTypes.object,
  subtitle: PropTypes.string,
  title: PropTypes.string,
};

export default compose(
  withAccountData,
  withAccountSettings,
  withProps (({
    asset: {
      address,
      name,
      symbol,
      ...asset
    },
    assets,
    nativeCurrencySymbol,
  }) => {
    const selectedAsset = ethereumUtils.getAsset(assets, address);
    return {
      change: get(selectedAsset, 'native.change', '-'),
      changeDirection: get(selectedAsset, 'price.relative_change_24h', 0) > 0,
      price: get(selectedAsset, 'native.price.display', null),
      selectedAsset,
      subtitle: get(selectedAsset, 'balance.display', symbol),
      title: name,
    };
  }),
  withHandlers({
    onPressSend: ({ navigation, asset }) => () => {
      navigation.goBack();

      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('SendSheet', { asset });
      });
    },
    onPressSwap: ({ navigation, asset }) => () => {
      navigation.goBack();

      InteractionManager.runAfterInteractions(() => {
        navigation.navigate('ExchangeModal', { asset });
      });
    },
  }),
  onlyUpdateForKeys(['price', 'subtitle']),
)(TokenExpandedState);
