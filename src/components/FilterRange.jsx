import { Button, InputNumber, Slider, Space } from 'antd';
import React, { useState } from 'react';

const FilterRange = ({
  setSelectedKeys,
  confirm,
  min,
  max
}) => {
  const [value, setValue] = useState([min, max]);
  return (
    <div
      style={{
        padding: 8
      }}
    >
      <InputNumber
        min={min}
        max={max}
        value={value[0]}
        onChange={(value) => {
          setValue((prev) => {
            if (value < min) {
              return [min, prev[1]];
            } else if (value > prev[1]) {
              return [prev[1], prev[1]];
            } else return [value, prev[1]];
          });
        }}
      />
      {' - '}
      <InputNumber
        min={min}
        max={max}
        value={value[1]}
        onChange={(value) => {
          setValue((prev) => {
            return [prev[0], value > max ? max : value];
          });
          setValue((prev) => {
            if (value > max) {
              return [prev[0], max];
            } else if (value < prev[0]) {
              return [prev[0], prev[0]];
            } else return [prev[0], value];
          });
        }}
      />
      <Slider
        range={{
          draggableTrack: true
        }}
        min={min}
        max={max}
        value={value}
        onChange={setValue}
      />
      <Space>
        <Button
          size="small"
          onClick={() => {
            setValue([min, max]);
          }}
        >
          Очистить
        </Button>
        <Button
          size="small"
          onClick={() => {
            setSelectedKeys(value);
            confirm({
              closeDropdown: true
            });
          }}
        >
          Применить
        </Button>
      </Space>
    </div>
  );
};

export default FilterRange;
