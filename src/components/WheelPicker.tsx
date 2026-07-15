import { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;

interface WheelPickerProps {
  items: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  width?: number;
}

export function WheelPicker({ items, selectedIndex, onIndexChange, width = 80 }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    if (!isUserScrolling.current) {
      scrollRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [selectedIndex]);

  function handleScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    isUserScrolling.current = false;
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    if (clampedIndex !== selectedIndex) {
      onIndexChange(clampedIndex);
    }
  }

  function handleScrollBegin() {
    isUserScrolling.current = true;
  }

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.highlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={(e) => {
          if (e.nativeEvent.velocity?.y === 0) {
            handleScrollEnd(e);
          }
        }}
      >
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text
              style={[
                styles.itemText,
                index === selectedIndex && styles.itemTextSelected,
              ]}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

interface TimePickerProps {
  hours: number;
  minutes: number;
  onTimeChange: (hours: number, minutes: number) => void;
  maxHours?: number;
}

export function TimePicker({ hours, minutes, onTimeChange, maxHours = 24 }: TimePickerProps) {
  const hourItems = Array.from({ length: maxHours + 1 }, (_, i) => i.toString());
  const minuteItems = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <View style={styles.timePickerContainer}>
      <WheelPicker
        items={hourItems}
        selectedIndex={hours}
        onIndexChange={(index) => onTimeChange(index, minutes)}
        width={70}
      />
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>h</Text>
      </View>
      <WheelPicker
        items={minuteItems}
        selectedIndex={minutes}
        onIndexChange={(index) => onTimeChange(hours, index)}
        width={70}
      />
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d0d0d0',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: '#999',
  },
  itemTextSelected: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    marginHorizontal: 4,
  },
  labelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
