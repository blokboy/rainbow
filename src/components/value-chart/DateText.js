import PropTypes from 'prop-types';
import React from 'react';
import { Text } from 'react-native';
import { colors, fonts } from '../../styles';


class DateText extends React.Component {

  state = {
    text: '0',
  }

  updateValue = (text) => {
    this.setState({ text });
  }

  render() {
    return (
      <Text style={{
        color: '#3c4252',
        opacity: 0.5,
        fontFamily: fonts.family.SFProDisplay,
      }}>
        {this.state.text}
      </Text>
    );
  }
}

DateText.propTypes = {
  text: PropTypes.string,
};

export default DateText;
