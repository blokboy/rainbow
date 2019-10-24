import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { useToggle } from 'react-native-redash';
import { exchangeModalBorderRadius } from '../../screens/ExchangeModal';
import { colors, position } from '../../styles';
import { EmptyAssetList } from '../asset-list';
import { ExchangeAssetList } from '../exchange';

const { greaterOrEq, cond } = Animated;

const CurrencySelectionList = ({
  listItems,
  renderItem,
  showList,
  transitionPosition,
  type,
}) => {
  const showListTransition = useToggle(showList, 500, Easing.out(Easing.ease));

  const skeletonOpacity = cond(
    greaterOrEq(transitionPosition, 1),
    cond(greaterOrEq(showListTransition, 1), 0, 1),
    1
  );

  return (
    <View height="100%">
      {showList ? (
        <View {...position.coverAsObject}>
          <ExchangeAssetList
            key={`ExchangeAssetListCurrencySelectionModal-${type}`}
            items={listItems}
            renderItem={renderItem}
            scrollIndicatorInsets={{
              bottom: exchangeModalBorderRadius,
            }}
          />
        </View>
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={{
          ...position.coverAsObject,
          backgroundColor: colors.white,
          opacity: skeletonOpacity,
        }}
      >
        <EmptyAssetList
          {...position.sizeAsObject('100%')}
          {...position.coverAsObject}
        />
      </Animated.View>
    </View>
  );
};

CurrencySelectionList.propTypes = {
  listItems: PropTypes.array,
  renderItem: PropTypes.func,
  showList: PropTypes.bool,
  transitionPosition: PropTypes.object,
  type: PropTypes.string,
};

export default React.memo(CurrencySelectionList);
