import { Button, Slider, Space } from 'antd';
import React from 'react';

const FilterRange = ({
  setSelectedKeys,
  selectedKeys,
  clearFilters,
  confirm
}) => {
  return (
    <div
      style={{
        padding: 8
      }}
    >
      <Slider
        range={{
          draggableTrack: true
        }}
        min={selectedKeys[0]}
        max={selectedKeys[1]}
        value={selectedKeys}
        onChange={setSelectedKeys}
      />
      <Space>
        <Button
          size="small"
          onClick={() => {
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
