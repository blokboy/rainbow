import PropTypes from 'prop-types';
import React from 'react';
import { Text } from 'react-native';


class ValueText extends React.Component {

  state = {
    text: '0',
  }

  updateValue = (text) => {
    this.setState({ text });
  }

  render() {
    return (
      <Text>
        {this.state.text}
      </Text>
    );
  }
}

ValueText.propTypes = {
  text: PropTypes.string,
};

export default ValueText;
