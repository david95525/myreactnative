import {Text, View} from 'react-native';
import {
  Area,
  /*AreaRange,*/
  CartesianChart,
  Line,
  Scatter,
} from 'victory-native';
const DATA = [
  {x: '一', lower: 120, middle: 150, upper: 180},
  {x: '二', lower: 200, middle: 230, upper: 260},
  {x: '三', lower: 194, middle: 224, upper: 254},
  {x: '四', lower: 188, middle: 218, upper: 248},
  {x: '五', lower: 105, middle: 135, upper: 165},
  {x: '六', lower: 117, middle: 147, upper: 177},
  {x: '日', lower: 230, middle: 260, upper: 290},
];
export function ChartVictoryNative() {
  return (
    <View style={{height: 300}}>
      <Text>Victory Native</Text>
      <CartesianChart
        data={DATA}
        xKey="x" // 👈 specify data key for x-axis
        yKeys={['middle', 'lower', 'upper']} // 👈 specify data keys used for y-axis
      >
        {/* 👇 render function exposes various data, such as points. */}
        {({points, chartBounds}) => (
          <>
            {/* <AreaRange
              upperPoints={points.upper}
              lowerPoints={points.lower}
              color="rgba(100, 100, 255, 0.2)"
              animate={{type: 'timing'}}
            /> */}
            <Line
              points={points.middle}
              color="#d6d6d7"
              strokeWidth={2}
              animate={{type: 'timing'}}
            />
            <Area
              points={points.middle}
              y0={chartBounds.bottom}
              color="rgba(230, 231, 231,0.8)"
              animate={{type: 'timing', duration: 300}}
            />
            <Scatter
              points={points.middle}
              radius={5}
              style="fill"
              color="#24262a"
            />
          </>
        )}
      </CartesianChart>
    </View>
  );
}
