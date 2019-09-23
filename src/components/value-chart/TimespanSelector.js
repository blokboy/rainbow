import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { deviceUtils } from '../../utils';
import { ButtonPressAnimation } from '../animations';
import ValueTime from './ValueTime';

const interval = {
  DAY: 0,
  WEEK: 1,
  MONTH: 2,
  YEAR: 3,
};

class TimespanSelector extends React.Component {
  propTypes = {
    reloadChart: PropTypes.func,
  };

  state = {
    currentInterval: 0,
  }

  reloadChartToDay = () => {
    this.setState({ currentInterval: interval.DAY });
    this.props.reloadChart(interval.DAY);
  }

  reloadChartToWeek = () => {
    this.setState({ currentInterval: interval.WEEK });
    this.props.reloadChart(interval.WEEK);
  }

  reloadChartToMonth = () => {
    this.setState({ currentInterval: interval.MONTH });
    this.props.reloadChart(interval.MONTH);
  }

  reloadChartToYear = () => {
    this.setState({ currentInterval: interval.YEAR });
    this.props.reloadChart(interval.YEAR);
  }

  render() {
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: deviceUtils.dimensions.width,
      }}>
        <ButtonPressAnimation onPress={this.reloadChartToDay}>
          <ValueTime selected={this.state.currentInterval === interval.DAY}>
            1D
          </ValueTime>
        </ButtonPressAnimation>
        <ButtonPressAnimation onPress={this.reloadChartToWeek}>
          <ValueTime selected={this.state.currentInterval === interval.WEEK}>
            1W
          </ValueTime>
        </ButtonPressAnimation>
        <ButtonPressAnimation onPress={this.reloadChartToMonth}>
          <ValueTime selected={this.state.currentInterval === interval.MONTH}>
            1M
          </ValueTime>
        </ButtonPressAnimation>
        <ButtonPressAnimation onPress={this.reloadChartToYear}>
          <ValueTime selected={this.state.currentInterval === interval.YEAR}>
            1Y
          </ValueTime>
        </ButtonPressAnimation>
      </View>
    );
  }
}

export default TimespanSelector;
