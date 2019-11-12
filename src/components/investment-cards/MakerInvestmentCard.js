import { floor } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { compose, pure, withHandlers, withProps } from 'recompact';
import { convertAmountToNativeDisplay } from '../../helpers/utilities';
import { withAccountSettings, withOpenInvestmentCards } from '../../hoc';
import { colors, padding } from '../../styles';
import { ButtonPressAnimation } from '../animations';
import Divider from '../Divider';
import { ColumnWithMargins, Row } from '../layout';
import { Text } from '../text';
import InvestmentCard from './InvestmentCard';
import InvestmentCardPill from './InvestmentCardPill';

const MakerInvestmentCardHeight = 114;

const AssetLabel = withProps({
  color: 'blueGreyDarkTransparent',
  lineHeight: 'tight',
  size: 'smedium',
})(Text);

const enhance = compose(
  withAccountSettings,
  pure,
  withHandlers({
    onPressContainer: ({ item, onPress }) => () => {
      if (onPress) {
        onPress(item);
      }
    },
  })
);

const MakerInvestmentCard = enhance(
  ({
    isCollapsible,
    item: {
      ethBalance,
      tokenBalance,
      tokenName,
      tokenSymbol,
      totalBalanceAmount,
      totalNativeDisplay,
      uniqueId,
    },
    nativeCurrency,
    onPress,
    onPressContainer,
    openInvestmentCards,
    ...props
  }) => (
    <InvestmentCard
      {...props}
      flex={0}
      gradientColors={['#3A4048', '#FFFFFF']}
      collapsed={openInvestmentCards[uniqueId]}
      uniqueId={uniqueId}
      containerHeight={MakerInvestmentCard.height}
      isExpandedState={!onPress}
      headerProps={{
        color: colors.dark,
        emoji: 'japanese_ogre',
        isCollapsible,
        title: 'CDP',
        titleColor: '#FFFFFF',
        value: floor(parseFloat(totalBalanceAmount), 4)
          ? totalNativeDisplay
          : `< ${convertAmountToNativeDisplay(0.01, nativeCurrency)}`,
      }}
      height={MakerInvestmentCardHeight}
    >
      <Divider
        backgroundColor={colors.transparent}
        color={colors.alpha(colors.blueGreyDark, 0.02)}
      />
      <ButtonPressAnimation
        disabled={!onPress}
        onPress={onPressContainer}
        scaleTo={0.96}
      >
        <ColumnWithMargins css={padding(8, 15, 15)} margin={6}>
          <Row align="center" justify="space-between">
            <AssetLabel>Liquidation Price</AssetLabel>
            <AssetLabel>Collateral Price</AssetLabel>
          </Row>
          <Row align="center" justify="space-between">
            <InvestmentCardPill value={ethBalance} />
            <InvestmentCardPill
              reverse
              symbol="ETH"
              value={tokenBalance}
            />
          </Row>
        </ColumnWithMargins>
      </ButtonPressAnimation>
    </InvestmentCard>
  )
);

MakerInvestmentCard.propTypes = {
  item: PropTypes.object,
  nativeCurrency: PropTypes.string,
  onPress: PropTypes.func,
  onPressContainer: PropTypes.func,
};

MakerInvestmentCard.height = MakerInvestmentCardHeight;

export default withOpenInvestmentCards(MakerInvestmentCard);
