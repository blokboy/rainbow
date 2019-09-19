import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { maxBy, minBy } from 'lodash';
import Svg, { Path } from 'react-native-svg';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { Easing } from 'react-native-reanimated';
import Bezier from 'bezier-spline';
import {
  contains,
  runTiming,
} from 'react-native-redash';
import { View } from 'react-native';
import {
  data1,
  data2,
  data3,
  data4,
} from './data';
import ValueText from './ValueText';
import DateText from './DateText';
import { deviceUtils } from '../../utils';
import { colors } from '../../styles';
import { ButtonPressAnimation } from '../animations';
import ValueTime from './ValueTime';
import TimestampText from './TimestampText';
import TrendIndicatorText from './TrendIndicatorText';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const {
  and,
  eq,
  add,
  sub,
  onChange,
  Value,
  Clock,
  block,
  event,
  concat,
  cond,
  call,
  set,
  multiply,
  greaterOrEq,
  lessThan,
  greaterThan,
  stopClock,
} = Animated;

const {
  ACTIVE,
  CANCELLED,
  END,
  FAILED,
  UNDETERMINED,
} = State;

const FALSE = 1;
const TRUE = 0;

const interval = {
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
  YEAR: 4,
};

const width = deviceUtils.dimensions.width - 130;
const height = 200;

const flipY = { transform: [{ scaleX: 1 }, { scaleY: -1 }] };

const indexInterval = 25;
const heightInterval = 200;

const pickImportantPoints = array => {
  const result = [];
  result.push(array[0]);
  let thresholdIndex = indexInterval;
  let thresholdHeight = array[0].y;
  for (let i = 1; i < array.length; i++) {
    if (i === array.length - 1) {
      result.push(array[i]);
    } else if (Math.abs(thresholdHeight - array[i].y) > heightInterval) {
      result.push(array[i]);
      thresholdIndex = i + indexInterval;
      thresholdHeight = array[i].y;
    } else if (array[i].y === 0 || array[i].y === 200) {
      result.push(array[i]);
      thresholdIndex = i + indexInterval;
      thresholdHeight = array[i].y;
    } else if (i === thresholdIndex) {
      result.push(array[i]);
      thresholdIndex += indexInterval;
      thresholdHeight = array[i].y;
    }
  }
  return result;
};

export default class ValueChart extends PureComponent {
  static propTypes = {
    change: PropTypes.string,
    changeDirection: PropTypes.bool,
  }

  touchX = new Value(150);

  constructor(props) {
    super(props);

    this.state = {
      currentInterval: interval.DAY,
      data: data1,
      hideLoadingBar: false,
      shouldRenderChart: false,
    };

    this.clock = new Clock();
    this.clockReversed = new Clock();
    this.opacityClock = new Clock();
    this.opacityClockReversed = new Clock();
    this.loadingClock = new Clock();
    this.loadingValue = new Value(1);
    this.gestureState = new Value(UNDETERMINED);
    this.handle = undefined;
    this.value = new Value(1);
    this.opacity = new Value(0);
    this.shouldSpring = new Value(0);
    this.isLoading = new Value(FALSE);

    this.onGestureEvent = event([{
      nativeEvent: {
        state: this.gestureState,
      },
    }]);
  }

  onPanGestureEvent = event([{ nativeEvent: { x: x => cond(and(greaterOrEq(x, 0), lessThan(x, width)), set(this.touchX, x)) } }], { useNativeDriver: true });

  reloadChart = (data, currentInterval) => {
    this.isLoading.setValue(TRUE);
    setTimeout(() => {
      this.setState({ currentInterval, data });
    }, 600);
    setTimeout(() => {
      this.isLoading.setValue(FALSE);
    }, 1600);
  }

  reloadChartToDay = () => {
    this.reloadChart(data1, interval.DAY);
  }

  reloadChartToWeek = () => {
    this.reloadChart(data2, interval.WEEK);
  }

  reloadChartToMonth = () => {
    this.reloadChart(data3, interval.MONTH);
  }

  reloadChartToYear = () => {
    this.reloadChart(data4, interval.YEAR);
  }

  createAnimatedPath = () => {
    const maxValue = maxBy(this.state.data, 'value');
    const minValue = minBy(this.state.data, 'value');

    const timestampLength = this.state.data[this.state.data.length - 1].timestamp - this.state.data[0].timestamp;
    const xMultiply = width / timestampLength;

    const yMultiply = height / (maxValue.value - minValue.value);

    const points = this.state.data.map(({ timestamp, value }) => ({
      x: (timestamp - this.state.data[0].timestamp) * xMultiply,
      y: (value - minValue.value) * yMultiply,
    }));

    // const startDate = String(new Date(this.state.data[0].timestamp).toLocaleTimeString());
    // const endDate = String(new Date(this.state.data[this.state.data.length - 1].timestamp).toLocaleTimeString());

    // const overallDate = String(new Date(this.state.data[0].timestamp).toLocaleDateString('en-US', {
    //   day: 'numeric',
    //   month: 'short',
    //   weekday: 'long',
    //   year: 'numeric',
    // }));

    const importantPoints = pickImportantPoints(points);
    const spline = new Bezier(importantPoints.map(({ x, y }) => [x, y]));
    const splinePoints = points
      .map(({ x, y }) => {
        const matchingPoints = spline.getPoints(0, x);
        if (matchingPoints.length !== 1) {
          return null;
        }
        return { x, y1: y, y2: matchingPoints[0][1] };
      })
      .filter(Boolean);

    const animatedPath = concat(
      'M 2 ',
      add(
        multiply(add(splinePoints[0].y1, multiply(this.value, sub(splinePoints[0].y2, splinePoints[0].y1))), this.loadingValue),
        sub(100, multiply(100, this.loadingValue)),
      ),
      ...splinePoints.flatMap(({ x, y1, y2 }) => [
        'L',
        x,
        ' ',
        add(multiply(add(y1, multiply(this.value, sub(y2, y1))), this.loadingValue), sub(100, multiply(100, this.loadingValue))),
      ]),
    );

    return animatedPath;
  }

  componentDidMount = () => {
    setTimeout(() => {
      this.setState({ shouldRenderChart: true });
    }, 500);
  }

  render() {
    const { change, changeDirection } = this.props;
    const maxValue = maxBy(this.state.data, 'value');
    const minValue = minBy(this.state.data, 'value');

    const animatedPath = this.state.shouldRenderChart ? this.createAnimatedPath() : null;
    console.log('rerender');
    return (
      <Fragment>
        <PanGestureHandler
          minDist={0}
          shouldActivateOnStart={true}
          onGestureEvent={this.onPanGestureEvent}
          onHandlerStateChange={this.onGestureEvent}
        >
          <Animated.View style={{
            justifyContent: 'flex-start',
          }}>
            <View style={{
              height: 112,
              justifyContent: 'space-between',
              paddingLeft: 15,
              paddingTop: 30,
            }}>
              <ValueText
                headerText="PRICE 🥳"
                startValue={this.state.data[this.state.data.length - 1].value}
                ref={component => { this._text = component; }}
              />
              <TrendIndicatorText direction={changeDirection}>
                {change}
              </TrendIndicatorText>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{
                height: 200,
                width,
              }}>
                <Svg
                  height={200}
                  width={width}
                  viewBox={`0 -50 ${width + 1} ${300}`}
                  preserveAspectRatio="none"
                  style={flipY}
                >
                  <AnimatedPath
                    id="main-path"
                    fill="none"
                    stroke={colors.chartGreen}
                    strokeWidth={2.4}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d={animatedPath}
                  />
                </Svg>
              </View>
              <Animated.View
                style={[{
                  backgroundColor: colors.chartGreen,
                  borderRadius: 2,
                  height: 180,
                  position: 'absolute',
                  top: 10,
                  width: 2,
                  zIndex: 10,
                }, {
                  opacity: this.opacity,
                  transform: [{ translateX: Animated.add(this.touchX, new Animated.Value(-1.5)) }],
                }]}
              />
              <Animated.View style={[{
                height: 200,
                justifyContent: 'space-between',
                paddingBottom: 20,
                paddingLeft: 20,
                paddingTop: 20,
                width: 100,
              }, {
                opacity: this.loadingValue,
              }]}>
                <TimestampText>
                  ${Number(maxValue.value).toFixed(2)}
                </TimestampText>
                <TimestampText>
                  ${Number((maxValue.value + minValue.value) / 2).toFixed(2)}
                </TimestampText>
                <TimestampText>
                  ${Number(minValue.value).toFixed(2)}
                </TimestampText>
              </Animated.View>
            </View>
          </Animated.View>
        </PanGestureHandler>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: deviceUtils.dimensions.width - 130,
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
        <Animated.Code
          exec={
            block([
              cond(
                eq(this.gestureState, ACTIVE),
                set(this.shouldSpring, 1),
              ),
              cond(
                contains([FAILED, CANCELLED, END], this.gestureState),
                block([
                  set(this.shouldSpring, 0),
                  call([this.touchX], ([x]) => {
                    this._text.updateValue(this.state.data[this.state.data.length - 1].value);
                  }),
                ]),
              ),
              onChange(
                this.touchX,
                call([this.touchX], ([x]) => {
                  this._text.updateValue(this.state.data[Math.floor(x / (width / this.state.data.length))].value);
                }),
              ),
              cond(
                and(greaterThan(this.value, 0), eq(this.shouldSpring, 1)),
                block([
                  stopClock(this.clockReversed),
                  set(
                    this.value,
                    runTiming(this.clock, this.value, {
                      duration: 350,
                      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                      toValue: 0,
                    }),
                  ),
                ]),
              ),
              cond(
                and(lessThan(this.value, 1), eq(this.shouldSpring, 0)),
                block([
                  stopClock(this.clock),
                  set(
                    this.value,
                    runTiming(this.clockReversed, this.value, {
                      duration: 350,
                      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                      toValue: 1,
                    }),
                  ),
                ]),
              ),
              cond(
                and(lessThan(this.opacity, 1), eq(this.shouldSpring, 1)),
                block([
                  set(
                    this.opacity,
                    runTiming(this.opacityClock, this.opacity, {
                      duration: 500,
                      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                      toValue: 1,
                    }),
                  ),
                  stopClock(this.opacityClockReversed),
                ]),
              ),
              cond(
                and(greaterThan(this.opacity, 0), eq(this.shouldSpring, 0)),
                block([
                  set(
                    this.opacity,
                    runTiming(this.opacityClockReversed, this.opacity, {
                      duration: 500,
                      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                      toValue: 0,
                    }),
                  ),
                  stopClock(this.opacityClock),
                ]),
              ),
              cond(
                this.shouldSpring, 0,
                set(
                  this.loadingValue,
                  runTiming(this.loadingClock, this.loadingValue, {
                    duration: 500,
                    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                    toValue: cond(eq(this.isLoading, 1), 1, 0),
                  }),
                ),
              ),
            ])
          }
        />
      </Fragment>
    );
  }
}
