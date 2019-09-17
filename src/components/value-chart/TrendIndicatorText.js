import PropTypes from 'prop-types';
import React from 'react';
import { Text, View } from 'react-primitives';
import { colors, fonts } from '../../styles';

const TrendIndicatorText = ({
  children,
  direction,
}) => (
  <View style={{
    flexDirection: 'row',
  }}>
    <View style={{
      backgroundColor: colors.chartGreen,
      borderRadius: 5,
      justifyContent: 'center',
      marginRight: 8,
    }}>
      <Text style={{
        fontFamily: fonts.family.SFProDisplay,
        fontSize: 12,
        paddingLeft: 5,
        paddingRight: 5,
        color: colors.white,
        fontWeight: fonts.weight.semibold,
      }}>
        {direction}
      </Text>
    </View>
    <Text style={{
      fontFamily: fonts.family.SFProDisplay,
      lineHeight: 17,
      color: colors.chartGreen,
      fontWeight: fonts.weight.semibold,
    }}>
      {children}
    </Text>
  </View>
);

TrendIndicatorText.propTypes = {
  children: PropTypes.string,
  direction: PropTypes.string,
};

export default TrendIndicatorText;
