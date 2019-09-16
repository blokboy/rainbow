import PropTypes from 'prop-types';
import React from 'react';
import { Text } from 'react-native';
import { colors, fonts } from '../../styles';

class ValueText extends React.Component {

  state = {
    text: '0',
  }

  updateValue = (text) => {
    this.setState({ text });
  }

  render() {
    return (
      <Text style={{
        color: colors.white,
        fontFamily: fonts.family.SFMono,
      }}>
        ${Number(this.state.text).toFixed(2)}
      </Text>
    );
  }
}

ValueText.propTypes = {
  text: PropTypes.string,
};

export default ValueText;
