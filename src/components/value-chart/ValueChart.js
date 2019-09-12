import React, { Fragment, PureComponent } from 'react';
import { maxBy, minBy } from 'lodash';
import Svg, { Path } from 'react-native-svg';
import { PanGestureHandler, createNativeWrapper, PureNativeButton, State, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing } from 'react-native-reanimated';
import Bezier from 'bezier-spline';
import {
  contains,
  runDelay,
  runTiming,
} from 'react-native-redash';
import data from './data';
import ValueText from './ValueText';
import { Text, View } from 'react-native';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const {
  or,
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
} = Animated;

const {
  ACTIVE,
  BEGAN,
  CANCELLED,
  END,
  FAILED,
  UNDETERMINED,
} = State;

const width = 300;
const height = 200;

const timestampLength = data[data.length - 1].timestamp - data[0].timestamp;
const xMultiply = width / timestampLength;

const maxValue = maxBy(data, 'value');
const minValue = minBy(data, 'value');
const yMultiply = height / (maxValue.value - minValue.value);

const points = data.map(({ timestamp, value }) => ({
  x: (timestamp - data[0].timestamp) * xMultiply,
  y: (value - minValue.value) * yMultiply,
}));

const startDate = String(new Date(data[0].timestamp).toLocaleTimeString());
const endDate = String(new Date(data[data.length - 1].timestamp).toLocaleTimeString());

console.log(points);

const flipY = { transform: [{ scaleX: 1 }, { scaleY: -1 }] };

// TODO: replace with a better algorithm.
const pickImportantPoints = array => {
  const result = [];
  // for (let i = 0; i < array.length; i += 30) {
  //   result.push(array[i]);
  // }
  result.push(array[0]);
  result.push(array[25]);
  result.push(array[39]);
  result.push(array[68]);
  result.push(array[100]);
  result.push(array[125]);
  result.push(array[array.length - 1]);
  return result;
};

export default class ValueChart extends PureComponent {
  _touchX = new Animated.Value(150);

  onPanGestureEvent = event([{ nativeEvent: { x: this._touchX }}], { useNativeDriver: true });

  constructor(props) {
    super(props);

    this.clock = new Clock();
    this.opacityClock = new Clock();
    this.gestureState = new Value(UNDETERMINED);
    this.handle = undefined;
    this.value = new Value(1);
    this.opacity = new Value(0);
    this.shouldSpring = new Value(-1);

    this.x0 = new Value(100);

    this.onGestureEvent = event([{
      nativeEvent: {
        state: this.gestureState,
      },
    }]);
  }

  render() {
    const importantPoints = pickImportantPoints(points);
    const spline = new Bezier(importantPoints.map(({ x, y }) => [x, y]));
    console.log(spline);
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
      'M -100 100',
      ...splinePoints.flatMap(({ x, y1, y2 }) => [
        'L',
        x,
        ' ',
        add(y1, multiply(this.value, sub(y2, y1))),
      ]),
    );

    return (
      <Fragment>
        <PanGestureHandler
          minDist={0}
          shouldActivateOnStart={true}
          onGestureEvent={this.onPanGestureEvent}
          onHandlerStateChange={this.onGestureEvent}
          shouldCancelWhenOutside={true}
        >
          <Animated.View style={{
            height: 150,
            justifyContent: 'center',
          }}>
            <Animated.View
              style={[{
                alignItems: 'center',
                backgroundColor: 'rgb(85, 195, 249)',
                borderRadius: 12.5,
                height: 25,
                justifyContent: 'center',
                marginBottom: 25,
                width: 60,
              }, {
                opacity: this.opacity,
                transform: [{ translateX: Animated.add(this._touchX, new Animated.Value(-30)) }],
              }]}
            >
              <ValueText
                ref={component => this._text = component}
              />
            </Animated.View>
            <Animated.View
              style={[{
                backgroundColor: 'rgb(85, 195, 249)',
                height: 250,
                position: 'absolute',
                top: -25,
                width: 3,
              }, {
                opacity: this.opacity,
                transform: [{ translateX: Animated.add(this._touchX, new Animated.Value(-1.5)) }],
              }]}
            />
            <Svg
              height={200}
              width={width}
              viewBox={`0 -15 ${width} ${height + 30}`}
              preserveAspectRatio="none"
              style={flipY}
            >
              <Path
                strokeWidth={1.5}
                stroke="rgb(240,240,240)"
                d="M0 0 L300 0"
              />
              <Path
                strokeWidth={1.5}
                stroke="rgb(240,240,240)"
                d="M0 66.6 L300 66.6"
              />
              <Path
                strokeWidth={1.5}
                stroke="rgb(240,240,240)"
                d="M0 133.2 L300 133.2"
              />
              <Path
                strokeWidth={1.5}
                stroke="rgb(240,240,240)"
                d="M0 200 L300 200"
              />
              <AnimatedPath
                id="main-path"
                fill="none"
                stroke="rgb(85, 195, 249)"
                strokeWidth={2}
                strokeLinejoin="round"
                d={animatedPath}
              />
            </Svg>
            <View style={{
              justifyContent: 'space-between',
              
            }}>
              <Text>
                {startDate}
              </Text>
              <Text>
                {endDate}
              </Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
        <Animated.Code
          exec={
            block([
              cond(
                or(eq(this.gestureState, ACTIVE), eq(this.gestureState, BEGAN)),
                set(this.shouldSpring, 1),
              ),
              cond(
                contains([FAILED, CANCELLED, END], this.gestureState),
                set(this.shouldSpring, 0),
              ),
              onChange(
                this._touchX,
                call([this._touchX], ([x]) => {
                  this._text.updateValue(data[Math.floor(x / 2)].value);
                }),
              ),
              set(
                this.value,
                runTiming(this.clock, this.value, {
                  duration: 350,
                  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                  toValue: cond(eq(this.shouldSpring, 1), 0, 1),
                }),
              ),
              set(
                this.opacity,
                runTiming(this.opacityClock, this.opacity, {
                  duration: 500,
                  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                  toValue: cond(eq(this.shouldSpring, 1), 1, 0),
                }),
              ),
            ])
          }
        />
      </Fragment>
    );
  }
}
