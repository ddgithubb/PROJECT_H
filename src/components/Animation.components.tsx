import React, { useRef, useEffect, memo } from 'react';
import { useState } from 'react';
import { Easing, Pressable } from 'react-native';
import { Animated } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';

export function FadeInView(props: any) {
  const { style, startOffsetX, ...otherProps } = props;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const offsetXAnim = useRef(new Animated.Value(startOffsetX || 0)).current;

  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: props.duration || 100,
        useNativeDriver: true,
      }
    ).start();
    if (startOffsetX) {
      Animated.timing(
        offsetXAnim,
        {
          toValue: 0,
          duration: props.duration || 100,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }
      ).start();
    }
  }, [])

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateX: offsetXAnim }] }]} { ...otherProps } />
  );
}

export function FadeInOutView(props: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { style, visible, ...otherProps } = props;

  useEffect(() => {
    if (visible) {
      fadeIn();
    } else {
      fadeOut();
    }
  }, [visible]);

  const fadeIn = () => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: props.duration || 80,
        useNativeDriver: true,
      }
    ).start();
  }

  const fadeOut = () => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 0,
        duration: Math.abs(props.duration - 30) || 50,
        useNativeDriver: true,
      }
    ).start();
  }

  return (
    <Animated.View style={[style, {opacity: fadeAnim }]} { ...otherProps } />
  );
}

export function ClickView(props: any) {
  const duration = props.duration ? props.duration : 30;
  const disabled = props.disabled || false;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { style, ...otherProps } = props;

  const onTouch = () => {
    if (!disabled) {
      Animated.timing(
        scaleAnim,
        {
          toValue: 0.80,
          duration: duration,
          useNativeDriver: true,
        }
      ).start();
    }
  }

  const onOff = () => {
    if (!disabled) {
      Animated.timing(
        scaleAnim,
        {
          toValue: 1,
          duration: duration - 10,
          useNativeDriver: true,
        }
      ).start();
    }
  }

  const onAction = () => {
    if (!disabled) {
      onOff();
      props.action ? props.action() : undefined;
    }
  }

  return (
    <Animated.View {...otherProps} onTouchStart={onTouch} onTouchCancel={onOff} onTouchEndCapture={onAction} style={[style, {transform: [{ scale: scaleAnim }], opacity: disabled ? 0.5 : 1 }]} />
  );
}

export function PushView(props: any) {
  const duration = props.duration ? props.duration : 30;
  const disabled = props.disabled || false;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [ pressed, setPressed ] = useState(props.pressed || false);
  const { style, ...otherProps } = props;

  useEffect(() => {
    props.pressed ? setPressed(true) : setPressed(false);
  });

  useEffect(() => {
    pressed ? onTouch() : onOff(); 
  }, [pressed]);

  const onTouch = () => {
    if (!disabled) {
      Animated.timing(
        scaleAnim,
        {
          toValue: 0.85,
          duration: duration,
          useNativeDriver: true,
        }
      ).start();
    }
  }

  const onOff = () => {
    if (!disabled) {
      Animated.timing(
        scaleAnim,
        {
          toValue: 1,
          duration: duration - 10,
          useNativeDriver: true,
        }
      ).start();
    }
  }

  const onAction = () => {
    if (!disabled) {
      if (pressed) {
        props.action ? props.action(false) : undefined;
      } else {
        props.action ? props.action(true) : undefined;
      }
    }
  }

  return (
    <Animated.View {...otherProps} onTouchStart={onTouch} onTouchCancel={onOff} onTouchEndCapture={onAction} style={[style, {...props.style, transform: [{ scale: scaleAnim }], opacity: disabled || pressed ? 0.5 : 1 }]} />
  );
}