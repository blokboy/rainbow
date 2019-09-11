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

const AnimatedPath = Animated.createAnimatedComponent(Path);

const {
  or,
  eq,
  add,
  sub,
  Value,
  Clock,
  clockRunning,
  createAnimatedComponent,
  stopClock,
  startClock,
  block,
  event,
  concat,
  cond,
  call,
  set,
  multiply,
  timing,
} = Animated;

const {
  ACTIVE,
  BEGAN,
  CANCELLED,
  END,
  FAILED,
  UNDETERMINED,
} = State;

const AnimatedRawButton = createNativeWrapper(
  createAnimatedComponent(PureNativeButton),
  {
    shouldActivateOnStart: true,
    shouldCancelWhenOutside: false,
  },
);

const width = 300;
const height = 200;

const timestampLength = data[data.length - 1].timestamp - data[0].timestamp;
const xMultiply = width / timestampLength;

const maxValue = maxBy(data, 'value');
const minValue = minBy(data, 'value');
const yMultiply = height / (maxValue.value - minValue.value);

const points = data.map(({ timestamp, value }) => ({
  x: (timestamp - data[0].timestamp) * xMultiply,
  y: value * yMultiply,
}));

const flipY = { transform: [{ scaleX: 1 }, { scaleY: -1 }] };

// TODO: replace with a better algorithm.
const pickImportantPoints = array => {
  const result = [];
  for (let i = 0; i < array.length; i += 40) {
    result.push(array[i]);
  }
  result.push(array[array.length - 1]);
  return result;
};

export default class ValueChart extends PureComponent {
  _touchX = new Animated.Value(300 / 2 - 30);

  onPanGestureEvent = Animated.event([{ nativeEvent: { x: this._touchX }}], { useNativeDriver: true });

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
      'M 0 0',
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
        >
          <Animated.View style={{
            height: 150,
            justifyContent: 'center',
          }}>
            <Animated.View
              style={[{
                backgroundColor: 'rgb(85, 195, 249)', height: 300, width: 3, position: 'absolute',
              }, {
                opacity: this.opacity,
                transform: [{ translateX: Animated.add(this._touchX, new Animated.Value(-1.5)) }],
              }]}
            />
            <Svg
              height={200}
              width={width}
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              style={flipY}
            >
              <AnimatedPath
                fill="none"
                stroke="rgb(85, 195, 249)"
                strokeWidth={2}
                d={animatedPath}
              />
            </Svg>
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
