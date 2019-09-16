import PropTypes from 'prop-types';
import React from 'react';
import { Text } from 'react-primitives';

const ValueTime = ({
  children,
  selected,
}) => (
  <Text style={{
    color: selected ? 'rgb(85, 195, 249)' : '#3c4252',
    lineHeight: 47,
    textAlign: 'center',
    width: 50,
  }}>
    {children}
  </Text>
);

ValueTime.propTypes = {
  children: PropTypes.string,
  selected: PropTypes.bool,
};

export default ValueTime;
