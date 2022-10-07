import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Slider, Space } from 'antd';
import React from 'react';
import { useCookies } from 'react-cookie';

export const FilterRange = (dataIndex) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters
  }) => (
    <div
      style={{
        padding: 8
      }}
    >
      <Slider
        range={{
          draggableTrack: true
        }}
        defaultValue={[20, 50]}
      />
      <Space>
        <Button
          // onClick={() => clearFilters && handleReset(clearFilters)}
          size="small"
          style={{
            width: 90
          }}
        >
          Очистить
        </Button>
        <Button
          size="small"
          onClick={() => {
            confirm({
              closeDropdown: false
            });
            // setSearchText(selectedKeys[0]);
            // setSearchedColumn(dataIndex);
          }}
        >
          Применить
        </Button>
      </Space>
    </div>
  ),

  onFilter: (value, record) =>
    record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  // onFilterDropdownOpenChange: (visible) => {
  //   if (visible) {
  //     setTimeout(() => searchInput.current?.select(), 100);
  //   }
  // },
  render: (text) => text
});
