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
import { Text, View } from 'react-native';
import { data1, data2, data3, data4 } from './data';
import ValueText from './ValueText';
import DateText from './DateText';
import { deviceUtils } from '../../utils';
import { fonts } from '../../styles';
import { ButtonPressAnimation } from '../animations';
import ValueTime from './ValueTime';

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
  BEGAN,
  CANCELLED,
  END,
  FAILED,
  UNDETERMINED,
} = State;

const FALSE = 1;
const TRUE = 0;

const width = deviceUtils.dimensions.width - 70;
const height = 200;

const flipY = { transform: [{ scaleX: 1 }, { scaleY: -1 }] };

const indexInterval = 10;
const heightInterval = 30;

const pickImportantPoints = array => {
  const result = [];
  result.push(array[0]);
  let thresholdIndex = indexInterval;
  let thresholdHeight = array[0].y;
  for (let i = 0; i < array.length; i++) {
    if (i === array.length - 1) {
      result.push(array[i]);
    } else if (Math.abs(thresholdHeight - array[i].y) > heightInterval) {
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
  touchX = new Value(150);

  constructor(props) {
    super(props);

    this.state = {
      data: data1,
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

    this.x0 = new Value(100);

    this.onGestureEvent = event([{
      nativeEvent: {
        state: this.gestureState,
      },
    }]);
  }

  onPanGestureEvent = event([{ nativeEvent: { x: x => cond(and(greaterOrEq(x, 0), lessThan(x, width)), set(this.touchX, x)) } }], { useNativeDriver: true });

  reloadChart = (data) => {
    this.isLoading.setValue(TRUE);
    setTimeout(() => {
      this.setState({ data });
    }, 600);
    setTimeout(() => {
      this.isLoading.setValue(FALSE);
    }, 1600);
  }

  reloadChartToDay = () => {
    this.reloadChart(data1);
  }

  reloadChartToWeek = () => {
    this.reloadChart(data2);
  }

  reloadChartToMonth = () => {
    this.reloadChart(data3);
  }

  reloadChartToYear = () => {
    this.reloadChart(data4);
  }

  render() {
    const timestampLength = this.state.data[this.state.data.length - 1].timestamp - this.state.data[0].timestamp;
    const xMultiply = width / timestampLength;

    const maxValue = maxBy(this.state.data, 'value');
    const minValue = minBy(this.state.data, 'value');
    const yMultiply = height / (maxValue.value - minValue.value);

    const points = this.state.data.map(({ timestamp, value }) => ({
      x: (timestamp - this.state.data[0].timestamp) * xMultiply,
      y: (value - minValue.value) * yMultiply,
    }));

    const startDate = String(new Date(this.state.data[0].timestamp).toLocaleTimeString());
    const endDate = String(new Date(this.state.data[this.state.data.length - 1].timestamp).toLocaleTimeString());

    const overallDate = String(new Date(this.state.data[0].timestamp).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      weekday: 'long',
      year: 'numeric',
    }));

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
      add(multiply(add(splinePoints[0].y1, multiply(this.value, sub(splinePoints[0].y2, splinePoints[0].y1))), this.loadingValue), sub(100, multiply(100, this.loadingValue))),
      ...splinePoints.flatMap(({ x, y1, y2 }) => [
        'L',
        x,
        ' ',
        add(multiply(add(y1, multiply(this.value, sub(y2, y1))), this.loadingValue), sub(100, multiply(100, this.loadingValue))),
      ]),
    );

    return (
      <Fragment>
        <PanGestureHandler
          minDist={0}
          shouldActivateOnStart={true}
          onGestureEvent={this.onPanGestureEvent}
          onHandlerStateChange={this.onGestureEvent}
        >
          <Animated.View style={{
            height: 150,
            justifyContent: 'center',
          }}>
            <Animated.Text style={[{
              color: '#3c4252',
              opacity: 0.5,
              textAlign: 'center',
              fontFamily: fonts.family.SFProDisplay,
              marginBottom: 10,
            }, {
              opacity: this.loadingValue,
            }]}>
              {overallDate}
            </Animated.Text>
            <Animated.View
              style={[{
                alignItems: 'center',
                backgroundColor: 'rgb(85, 195, 249)',
                borderRadius: 12.5,
                height: 25,
                justifyContent: 'center',
                marginBottom: 8,
                top: 0,
                width: 100,
              }, {
                opacity: this.opacity,
                transform: [{ translateX: Animated.add((width / 2) - 50, multiply(sub(this.touchX, width / 2), 0.8)) }],
              }]}
            >
              <ValueText
                ref={component => this._text = component}
              />
            </Animated.View>
            <Animated.View
              style={[{
                backgroundColor: 'rgb(85, 195, 249)',
                height: 200,
                position: 'absolute',
                top: -11.5,
                width: 3,
                zIndex: 10,
              }, {
                opacity: this.opacity,
                transform: [{ translateX: Animated.add(this.touchX, new Animated.Value(-1.5)) }],
              }]}
            />
            <Svg
              height={200}
              width={width}
              viewBox={`0 -30 ${width + 1} ${height + 40}`}
              preserveAspectRatio="none"
              style={flipY}
            >
              <AnimatedPath
                id="main-path"
                fill="none"
                stroke="rgb(85, 195, 249)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                d={animatedPath}
              />
            </Svg>
            <Animated.View style={[{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }, {
              opacity: multiply(this.loadingValue, this.value),
            }]}>
              <Text style={{
                color: '#3c4252',
                opacity: 0.5,
                flex: 1,
                textAlign: 'left',
                fontFamily: fonts.family.SFProDisplay,
              }}>
                {startDate}
              </Text>
              <Text style={{
                color: '#3c4252',
                opacity: 0.5,
                flex: 1,
                textAlign: 'right',
                fontFamily: fonts.family.SFProDisplay,
              }}>
                {endDate}
              </Text>
            </Animated.View>
            <Animated.View
              style={[{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: -17,
              }, {
                opacity: this.opacity,
              }]}
            >
              <DateText
                ref={component => this._date = component}
              />
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginLeft: 15, marginRight: 15, top: 65 }}>
          <ButtonPressAnimation onPress={this.reloadChartToDay}>
            <ValueTime selected={this.state.data === data1}>
              Day
            </ValueTime>
          </ButtonPressAnimation>
          <ButtonPressAnimation onPress={this.reloadChartToWeek}>
            <ValueTime selected={this.state.data === data2}>
              Week
            </ValueTime>
          </ButtonPressAnimation>
          <ButtonPressAnimation onPress={this.reloadChartToMonth}>
            <ValueTime selected={this.state.data === data3}>
              Month
            </ValueTime>
          </ButtonPressAnimation>
          <ButtonPressAnimation onPress={this.reloadChartToYear}>
            <ValueTime selected={this.state.data === data4}>
              Year
            </ValueTime>
          </ButtonPressAnimation>
        </View>
        <Animated.Code
          exec={
            block([
              cond(
                eq(this.gestureState, BEGAN),
                set(this.shouldSpring, 1),
              ),
              cond(
                contains([FAILED, CANCELLED, END], this.gestureState),
                set(this.shouldSpring, 0),
              ),
              onChange(
                this.touchX,
                call([this.touchX], ([x]) => {
                  this._text.updateValue(this.state.data[Math.floor(x / (width / this.state.data.length))].value);
                  this._date.updateValue(String(new Date(this.state.data[Math.floor(x / (width / this.state.data.length))].timestamp).toLocaleTimeString()));
                }),
              ),
              cond(
                and(greaterThan(this.value, 0), eq(this.shouldSpring, 1)),
                block([
                  set(
                    this.value,
                    runTiming(this.clock, this.value, {
                      duration: 350,
                      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                      toValue: 0,
                    }),
                  ),
                  stopClock(this.clockReversed),
                ]),
                cond(
                  and(lessThan(this.value, 1), eq(this.shouldSpring, 0)),
                  block([
                    set(
                      this.value,
                      runTiming(this.clockReversed, this.value, {
                        duration: 350,
                        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                        toValue: 1,
                      }),
                    ),
                    stopClock(this.clock),
                  ]),
                ),
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
