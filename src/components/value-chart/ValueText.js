import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components/primitives';
import { View } from 'react-native';
import { colors, fonts } from '../../styles';
import { TruncatedText, Monospace } from '../text';

const HeadingTextStyles = {
  color: colors.dark,
  family: 'SFProText',
  weight: 'bold',
};

const Title = styled(TruncatedText).attrs(HeadingTextStyles)`
  margin-top: -12px;
  flex: 1;
  font-size: 30px;
`;

const Header = styled(TruncatedText)`
  flex: 1;
  font-size: ${fonts.size.smedium};
  color: ${colors.blueGreyLight};
  font-weight: ${fonts.weight.semibold};
  letter-spacing: 1.3;
`;

class ValueText extends React.Component {
  static propTypes = {
    headerText: PropTypes.string,
    startValue: PropTypes.string,
    text: PropTypes.string,
  };

  state = {
    text: this.props.startValue,
  }

  updateValue = (text) => {
    this.setState({ text });
  }

  render() {
    return (
      <View style={{ height: 60 }}>
        <Header>
          {this.props.headerText}
        </Header>
        <Title>
          ${Number(this.state.text).toFixed(2)}
        </Title>
      </View>
    );
  }
}

export default ValueText;
